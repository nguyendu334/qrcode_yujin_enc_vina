const { pool } = require("../config/db");
const { sendChecksheetEmail } = require("../services/emailService");

// API lấy Checksheet theo mã máy
const getCheckSheet = async (req, res) => {
  try {
    const { machine_id } = req.query;
    if (!machine_id) {
      return res
        .status(400)
        .json({ error: "Thiếu thông tin machine_id trên đường dẫn!" });
    }

    // 1. Cập nhật câu lệnh SQL: JOIN thêm bảng users để lấy tên người duyệt (approver_name)
    const machineQuery = `
        SELECT 
          m.machine_id,
          m.machine_code,
          m.machine_name,
          line_no,
          m.machine_type_id,
          mt.machine_type_name,
          ct.template_id,          
          ct.frequency,
          u.full_name AS approver_name,
          u.user_id as approver_id
        FROM machine m
        JOIN machine_type mt ON mt.machine_type_id = m.machine_type_id
        LEFT JOIN checklist_template ct ON ct.template_id = m.machine_type_id
        LEFT JOIN users u ON ct.approver_id = u.user_id
        WHERE m.machine_id = $1;
      `;
    const machineResult = await pool.query(machineQuery, [machine_id]);
    if (machineResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy thiết bị này trên hệ thống!" });
    }

    const machineInfo = machineResult.rows[0];

    // 2. Lấy danh sách hạng mục dựa trên template_id (chính là machine_type_id của máy)
    const itemsQuery = `
        SELECT 
          item_id, 
          item_name, 
          item_type, 
          standard_value, 
          unit, 
          min_value, 
          max_value, 
          display_order
        FROM checklist_item
        WHERE template_id = $1
        ORDER BY display_order;
      `;
    const itemsResult = await pool.query(itemsQuery, [
      machineInfo.machine_type_id,
    ]);

    // Trả về dữ liệu đồng bộ cho Frontend
    res.json({
      machine: machineInfo, // Trong object này bây giờ sẽ có thêm trường approver_name
      checklistItems: itemsResult.rows,
    });
  } catch (err) {
    console.error("Lỗi hệ thống API Checksheet:", err.message);
    res.status(500).json({ error: "Lỗi server: " + err.message });
  }
};

const checkDuplicateChecksheet = async (req, res) => {
  // Lấy thêm shift từ Frontend truyền lên
  const { machine_id, date, shift } = req.query;

  if (!machine_id || !date || !shift) {
    return res
      .status(400)
      .json({ error: "Thiếu machine_id, date hoặc shift để kiểm tra!" });
  }

  try {
    const checkDate = new Date(date).toISOString().split("T")[0];

    // Thêm điều kiện AND shift = $3
    const result = await pool.query(
      `SELECT 1 
       FROM inspection_header 
       WHERE machine_id = $1 
         AND DATE(inspection_date) = $2 
         AND shift = $3 
       LIMIT 1`,
      [machine_id, checkDate, shift.trim()]
    );

    // Trả về true nếu máy + ngày + ca đó đã được check
    res.json({ isDuplicate: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API Submit checksheet
// const sendInfoCheckSheet = async (req, res) => {
//   const {
//     machine_id,
//     inspector,
//     inspection_date,
//     shift,
//     check_results,
//     approver_id,
//   } = req.body;

//   if (!machine_id || !inspector || !shift || !check_results || !approver_id) {
//     return res
//       .status(400)
//       .json({ error: "Thiếu thông tin bắt buộc để nộp phiếu!" });
//   }

//   // Kết nối database sử dụng Client từ Pool để chạy Transaction
//   const client = await pool.connect();

//   try {
//     const checkDate = new Date(inspection_date).toISOString().split("T")[0];

//     // 1. ĐÃ SỬA: Kiểm tra trùng theo machine_id + date + shift (Ca làm việc)
//     const duplicateCheckQuery = `
//       SELECT inspection_id
//       FROM inspection_header
//       WHERE machine_id = $1
//         AND DATE(inspection_date) = $2
//         AND shift = $3
//       LIMIT 1;
//     `;
//     const duplicateResult = await client.query(duplicateCheckQuery, [
//       machine_id,
//       checkDate,
//       shift,
//     ]);

//     // Nếu đã tồn tại bản ghi của ca này trong ngày, chặn ngay lập tức
//     if (duplicateResult.rows.length > 0) {
//       client.release(); // Giải phóng kết nối
//       return res.status(400).json({
//         error: `Thiết bị này đã được tạo phiếu kiểm tra vào ngày ${checkDate} (${shift}) rồi! Không thể kiểm tra thêm lần nữa.`,
//       });
//     }

//     // Bắt đầu Transaction
//     await client.query("BEGIN");

//     // 2. Thêm bản ghi vào bảng inspection_header
//     const headerQuery = `
//         INSERT INTO inspection_header (machine_id, inspector, inspection_date, shift, approver_id)
//         VALUES ($1, $2, timezone('Asia/Ho_Chi_Minh', $3::timestamptz), $4, $5)
//         RETURNING inspection_id;
//       `;
//     const headerResult = await client.query(headerQuery, [
//       machine_id,
//       inspector,
//       inspection_date,
//       shift,
//       approver_id,
//     ]);

//     const inspectionId = headerResult.rows[0].inspection_id;

//     // 3. Thêm chi tiết kiểm tra vào inspection_detail
//     const detailQuery = `
//       INSERT INTO inspection_detail (inspection_id, item_id, result, value, remark)
//       VALUES ($1, $2, $3, $4, $5);
//     `;

//     for (const itemData of check_results) {
//       const itemId = parseInt(itemData.item_id, 10);
//       const resultField = itemData.result;
//       const valueField = itemData.value;
//       const remarkField = itemData.remark || null;

//       await client.query(detailQuery, [
//         inspectionId,
//         itemId,
//         resultField,
//         valueField,
//         remarkField,
//       ]);
//     }

//     // 4. LẤY EMAIL NGƯỜI DUYỆT & TÊN MÁY ĐỂ GỬI MAIL
//     const infoQuery = `
//       SELECT
//         (SELECT email FROM users WHERE user_id = $1) AS approver_email,
//         (SELECT machine_name FROM machine WHERE machine_id = $2) AS machine_name
//     `;
//     const infoResult = await client.query(infoQuery, [approver_id, machine_id]);
//     const approverEmail = infoResult.rows[0]?.approver_email;
//     const machineName = infoResult.rows[0]?.machine_name || machine_id;

//     // Xác nhận lưu toàn bộ thay đổi vào Database (CHỈ GỌI 1 LẦN)
//     await client.query("COMMIT");

//     // 5. GỬI MAIL NGẦM (SAU KHI COMMIT THÀNH CÔNG)
//     if (approverEmail) {
//       sendChecksheetEmail(approverEmail, {
//         machine_id,
//         machine_name: machineName,
//         inspector,
//         inspection_date: checkDate,
//         shift,
//         check_results,
//       }).catch((err) =>
//         console.error("❌ Lỗi khi gửi email thông báo ngầm:", err.message),
//       );
//     }

//     // Trả kết quả thành công về cho client
//     res.status(201).json({
//       success: true,
//       message: "Lưu bảng kiểm tra thành công!",
//       inspection_id: inspectionId,
//     });
//   } catch (err) {
//     // Hoàn tác dữ liệu nếu có lỗi
//     await client.query("ROLLBACK");
//     console.error("Lỗi khi thực thi lưu Transaction Checksheet:", err.message);
//     res
//       .status(500)
//       .json({ error: "Lỗi hệ thống khi lưu kết quả kiểm tra: " + err.message });
//   } finally {
//     // Giải phóng kết nối
//     client.release();
//   }
// };

const sendInfoCheckSheet = async (req, res) => {
  const { machine_id, inspector, check_results, approver_id } = req.body; // Bỏ 'shift' và 'inspection_date' khỏi yêu cầu từ client

  // Validate thông tin đầu vào (Không cần validate shift nữa)
  if (!machine_id || !inspector || !check_results || !approver_id) {
    return res
      .status(400)
      .json({ error: "Thiếu thông tin bắt buộc để nộp phiếu!" });
  }

  const client = await pool.connect();

  try {
    // ----------------------------------------------------------------------
    // BƯỚC 1: TỰ ĐỘNG XÁC ĐỊNH CA LÀM VIỆC & NGÀY LÀM VIỆC (WORK DATE)
    // ----------------------------------------------------------------------
    const now = new Date();
    const hours = now.getHours();
    const timeStr = now.toTimeString().split(" ")[0];

    let autoShift = "";
    let workDateObj = new Date(now);

    // Khung giờ 1: Ca ngày (08:00 -> 19:59)
    if (hours >= 8 && hours < 20) {
      autoShift = "Ca ngày";
    }
    // Khung giờ 2: Ca đêm (20:00 -> 07:59 sáng hôm sau)
    else {
      autoShift = "Ca đêm";
      // Nếu kiểm tra vào khoảng 00:00 -> 07:59 sáng -> Lùi 1 ngày làm việc
      if (hours < 8) {
        workDateObj.setDate(workDateObj.getDate() - 1);
      }
    }

    // Lấy ngày chuẩn định dạng YYYY-MM-DD
    const checkDate = workDateObj.toISOString().split("T")[0];

    const fullTimestamp = `${checkDate} ${timeStr}`;

    // ----------------------------------------------------------------------
    // BƯỚC 2: KIỂM TRA TRÙNG THEO machine_id + checkDate + autoShift
    // ----------------------------------------------------------------------
    const duplicateCheckQuery = `
      SELECT inspection_id 
      FROM inspection_header 
      WHERE machine_id = $1 
        AND DATE(inspection_date) = $2 
        AND shift = $3
      LIMIT 1;
    `;
    const duplicateResult = await client.query(duplicateCheckQuery, [
      machine_id,
      checkDate,
      autoShift,
    ]);

    if (duplicateResult.rows.length > 0) {
      client.release();
      return res.status(400).json({
        error: `Thiết bị này đã được tạo phiếu kiểm tra cho ${autoShift} ngày ${checkDate} rồi!`,
      });
    }

    // ----------------------------------------------------------------------
    // BƯỚC 3: BẮT ĐẦU TRANSACTION & INSERT HEADER
    // ----------------------------------------------------------------------
    await client.query("BEGIN");

    const headerQuery = `
      INSERT INTO inspection_header (machine_id, inspector, inspection_date, shift, approver_id)
      VALUES ($1, $2, $3::timestamp, $4, $5)
      RETURNING inspection_id;
    `;
    const headerResult = await client.query(headerQuery, [
      machine_id,
      inspector,
      fullTimestamp,
      autoShift,
      approver_id,
    ]);

    const inspectionId = headerResult.rows[0].inspection_id;

    // ----------------------------------------------------------------------
    // BƯỚC 4: INSERT CHI TIẾT VÀO BẢNG inspection_detail
    // ----------------------------------------------------------------------
    const detailQuery = `
      INSERT INTO inspection_detail (inspection_id, item_id, result, value, remark)
      VALUES ($1, $2, $3, $4, $5);
    `;

    for (const itemData of check_results) {
      const itemId = parseInt(itemData.item_id, 10);
      const resultField = itemData.result;
      const valueField = itemData.value;
      const remarkField = itemData.remark || null;

      await client.query(detailQuery, [
        inspectionId,
        itemId,
        resultField,
        valueField,
        remarkField,
      ]);
    }

    // ----------------------------------------------------------------------
    // BƯỚC 5: LẤY EMAIL NGƯỜI DUYỆT & TÊN MÁY ĐỂ GỬI MAIL
    // ----------------------------------------------------------------------
    const infoQuery = `
      SELECT 
        (SELECT email FROM users WHERE user_id = $1) AS approver_email,
        (SELECT machine_name FROM machine WHERE machine_id = $2) AS machine_name
    `;
    const infoResult = await client.query(infoQuery, [approver_id, machine_id]);
    const approverEmail = infoResult.rows[0]?.approver_email;
    const machineName = infoResult.rows[0]?.machine_name || machine_id;

    await client.query("COMMIT");

    // ----------------------------------------------------------------------
    // BƯỚC 6: GỬI EMAIL THÔNG BÁO NGẦM
    // ----------------------------------------------------------------------
    if (approverEmail) {
      sendChecksheetEmail(approverEmail, {
        machine_id,
        machine_name: machineName,
        inspector,
        inspection_date: checkDate,
        shift: autoShift,
        check_results,
      }).catch((err) =>
        console.error("❌ Lỗi khi gửi email thông báo ngầm:", err.message)
      );
    }

    res.status(201).json({
      success: true,
      message: "Lưu bảng kiểm tra thành công!",
      inspection_id: inspectionId,
      assigned_shift: autoShift,
      assigned_date: checkDate,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Lỗi khi thực thi lưu Transaction Checksheet:", err.message);
    res
      .status(500)
      .json({ error: "Lỗi hệ thống khi lưu kết quả kiểm tra: " + err.message });
  } finally {
    client.release();
  }
};

// Controller: Lấy danh sách Người phê duyệt theo machine_id
const getApproversByMachine = async (req, res) => {
  try {
    const { machineId } = req.params;

    // Lọc User có cùng department_id với Machine
    const query = `
      SELECT DISTINCT u.user_id, u.full_name, u.email
      FROM machine m
      JOIN users u ON u.department_id = m.department_id
      WHERE m.machine_id = $1 
        AND u.active = true
      ORDER BY u.full_name ASC;
    `;

    const result = await pool.query(query, [machineId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi lấy danh sách người duyệt:", err.message);
    res
      .status(500)
      .json({ error: "Lỗi hệ thống khi lấy danh sách người duyệt" });
  }
};
module.exports = {
  getCheckSheet,
  checkDuplicateChecksheet,
  sendInfoCheckSheet,
  getApproversByMachine,
};
