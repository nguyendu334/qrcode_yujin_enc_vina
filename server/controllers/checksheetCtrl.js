const { pool } = require("../config/db");

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
          m.machine_type_id,
          mt.machine_type_name,
          ct.template_id,            -- Lấy thêm template_id trả về cho frontend nếu cần
          ct.frequency,
          u.full_name AS approver_name, -- Lấy chính xác tên đầy đủ của người duyệt cấu hình trong template
          u.user_id as approver_id
        FROM machine m
        JOIN machine_type mt ON mt.machine_type_id = m.machine_type_id
        LEFT JOIN checklist_template ct ON ct.template_id = m.machine_type_id
        LEFT JOIN users u ON ct.approver_id = u.user_id -- 👈 JOIN sang bảng users để lấy thông tin người duyệt
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

// API Submit checksheet
const sendInfoCheckSheet = async (req, res) => {
  const {
    machine_id,
    inspector,
    inspection_date,
    shift,
    check_results,
    approver_id,
  } = req.body;

  if (!machine_id || !inspector || !shift || !check_results || !approver_id) {
    return res
      .status(400)
      .json({ error: "Thiếu thông tin bắt buộc để nộp phiếu!" });
  }

  // Kết nối database sử dụng Client từ Pool để chạy Transaction
  const client = await pool.connect();

  try {
    // Bắt đầu Transaction
    await client.query("BEGIN");

    // 1. Thêm bản ghi vào bảng inspection_header theo cấu trúc hình image_0f4417.png
    const headerQuery = `
        INSERT INTO inspection_header (machine_id, inspector, inspection_date, shift, approver_id)
        VALUES ($1, $2, timezone('Asia/Ho_Chi_Minh', $3::timestamptz), $4, $5)
        RETURNING inspection_id;
      `;
    const headerResult = await client.query(headerQuery, [
      machine_id,
      inspector,
      inspection_date, // Chuỗi định dạng ngày giờ gửi từ Frontend
      shift,
      approver_id,
    ]);

    const inspectionId = headerResult.rows[0].inspection_id;

    // 2. Duyệt qua danh sách kết quả các item để thêm vào inspection_detail theo hình image_0f4436.png
    const detailQuery = `
      INSERT INTO inspection_detail (inspection_id, item_id, result, value, remark)
      VALUES ($1, $2, $3, $4, $5);
    `;

    // Vì check_results gửi lên giờ là MẢNG: [ { item_id, result, value }, ... ]
    for (const itemData of check_results) {
      // Lấy trực tiếp giá trị đã tách biệt từ frontend, remark mặc định là null hoặc chuỗi rỗng
      const itemId = parseInt(itemData.item_id, 10);
      const resultField = itemData.result; // Nhận chuẩn giá trị (ví dụ: 'OK', 'NG' hoặc null)
      const valueField = itemData.value; // Nhận chuẩn giá trị (ví dụ: '0.5', '200' hoặc null)
      const remarkField = itemData.remark || null; // Nếu có remark thì lưu, không thì để null

      // Thực thi lưu từng dòng hạng mục chi tiết vào database
      await client.query(detailQuery, [
        inspectionId,
        itemId,
        resultField,
        valueField,
        remarkField,
      ]);
    }

    // Xác nhận lưu toàn bộ thay đổi thành công vào Database
    await client.query("COMMIT");
    res.status(201).json({
      success: true,
      message: "Lưu bảng kiểm tra thành công!",
      inspection_id: inspectionId,
    });
  } catch (err) {
    // Hoàn tác dữ liệu nếu có bất kỳ lỗi nào xảy ra để tránh rác DB
    await client.query("ROLLBACK");
    console.error("Lỗi khi thực thi lưu Transaction Checksheet:", err.message);
    res
      .status(500)
      .json({ error: "Lỗi hệ thống khi lưu kết quả kiểm tra: " + err.message });
  } finally {
    // Giải phóng kết nối ngược lại vào Pool
    client.release();
  }
};

module.exports = { getCheckSheet, sendInfoCheckSheet };
