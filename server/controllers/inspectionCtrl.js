const { pool } = require("../config/db");

// const getInspectionHeader = async (req, res) => {
//   try {
//     const { fromDate, toDate, machineId, shift } = req.query;

//     // Câu lệnh SQL JOIN giữa inspection_header và machine
//     let sql = `
//         SELECT
//           h.inspection_id AS "id",
//           m.machine_code AS "machineCode",
//           m.machine_name AS "machineName",
//           h.inspector,
//           h.shift,
//           h.inspection_date AS "date",
//           h.approval_status,
//           h.approver_id,
//           u.full_name AS "approver_name" -- 🌟 Lấy thêm tên đầy đủ của người duyệt
//         FROM inspection_header h
//         LEFT JOIN machine m ON h.machine_id = m.machine_id
//         LEFT JOIN users u ON h.approver_id = u.user_id -- 🌟 JOIN với bảng users qua approver_id (Sửa u.id thành cột ID của bảng user nếu khác)
//         WHERE 1=1
//       `;
//     const params = [];
//     let paramIndex = 1;

//     // Xử lý bộ lọc tìm kiếm
//     if (fromDate) {
//       sql += ` AND h.inspection_date >= $${paramIndex}`;
//       params.push(`${fromDate} 00:00:00`);
//       paramIndex++;
//     }
//     if (toDate) {
//       sql += ` AND h.inspection_date <= $${paramIndex}`;
//       params.push(`${toDate} 23:59:59`);
//       paramIndex++;
//     }
//     if (machineId) {
//       sql += ` AND h.machine_id = $${paramIndex}`;
//       params.push(machineId);
//       paramIndex++;
//     }
//     if (shift) {
//       sql += ` AND h.shift = $${paramIndex}`;
//       params.push(shift);
//       paramIndex++;
//     }
//     sql += ` ORDER BY h.inspection_date DESC`;

//     const result = await pool.query(sql, params);
//     res.json({ success: true, data: result.rows });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Lấy theo người phê duyệt
const getInspectionHeader = async (req, res) => {
  try {
    const { fromDate, toDate, machineId, shift } = req.query;
    const loggedInApproverId =
      req.user?.id || req.user?.user_id || req.query.userId;
    const role = req.user?.role || req.query.role; // Lấy role người dùng

    if (!loggedInApproverId && !role) {
      return res
        .status(401)
        .json({ success: false, message: "Bạn cần đăng nhập để xem dữ liệu!" });
    }

    const isManager = role === "manager";

    let sql = `
        SELECT DISTINCT
          h.inspection_id AS "id",
          m.machine_code AS "machineCode",
          m.machine_name AS "machineName",
          h.inspector,
          h.shift,
          h.inspection_date AS "date",
          h.approval_status,
          h.approver_id,
          u.full_name AS "approver_name"
        FROM inspection_header h
        LEFT JOIN machine m ON h.machine_id = m.machine_id
        LEFT JOIN users u ON h.approver_id = u.user_id
        LEFT JOIN machine_type mt ON m.machine_type_id = mt.machine_type_id
        LEFT JOIN checklist_template ct ON mt.machine_type_id = ct.machine_type_id
        WHERE 1=1
      `;

    const params = [];
    let paramIndex = 1;

    // 🌟 Nếu KHÔNG PHẢI Manager/Admin thì mới lọc theo approver_id
    if (!isManager) {
      sql += ` AND ct.approver_id = $${paramIndex}`;
      params.push(loggedInApproverId);
      paramIndex++;
    }

    // Xử lý các bộ lọc tìm kiếm
    if (fromDate) {
      sql += ` AND h.inspection_date >= $${paramIndex}`;
      params.push(`${fromDate} 00:00:00`);
      paramIndex++;
    }
    if (toDate) {
      sql += ` AND h.inspection_date <= $${paramIndex}`;
      params.push(`${toDate} 23:59:59`);
      paramIndex++;
    }
    if (machineId) {
      sql += ` AND h.machine_id = $${paramIndex}`;
      params.push(machineId);
      paramIndex++;
    }
    if (shift) {
      sql += ` AND h.shift = $${paramIndex}`;
      params.push(shift);
      paramIndex++;
    }

    sql += ` ORDER BY h.inspection_date DESC`;

    const result = await pool.query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Lỗi getInspectionHeader:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInspectionDetail = async (req, res) => {
  try {
    // 1. Ép kiểu ID về dạng Số nguyên (int) để khớp kiểu int4 của PostgreSQL
    const inspectionId = parseInt(req.params.inspectionId, 10);

    if (isNaN(inspectionId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }

    // 2. Chuyển sang câu SELECT tối giản (Không JOIN vội) để test xem có chạy được không
    // Nếu câu này chạy thành công, chứng tỏ lỗi 500 trước đó là do sai tên cột ở bảng checklist_item
    const sql = `
        SELECT 
    d.detail_id AS "id",
    d.inspection_id,
    d.item_id,
    c.item_name AS "item",       -- Thử lấy tên hạng mục
    c.standard_value AS "standard",    -- Thử lấy tiêu chuẩn quản lý
    d.result,
    d.value,
    d.remark,
    ih.approval_status,
    u.full_name AS "approver_name"
  FROM inspection_detail d
  LEFT JOIN checklist_item c ON d.item_id = c.item_id 
  JOIN inspection_header ih ON d.inspection_id = ih.inspection_id
  LEFT JOIN users u ON ih.approver_id = u.user_id
  WHERE d.inspection_id = $1
  ORDER BY d.detail_id ASC
      `;

    const result = await pool.query(sql, [inspectionId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    // In trực tiếp nguyên nhân lỗi ra terminal backend để bạn dễ nhìn lý do cụ thể
    console.error("❌ LỖI API DETAILS:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveInspection = async (req, res) => {
  const inspectionId = req.params.id;
  const { status, comment } = req.body;

  // 🌟 Lấy ID và Quyền của người đang đăng nhập từ middleware verifyToken
  const currentUserId = req.user?.user_id;
  const currentUserRole = req.user?.role;

  if (!["approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Trạng thái phê duyệt không hợp lệ!" });
  }

  try {
    // 1. 🔍 BƯỚC THÊM MỚI: Truy vấn thông tin phiếu lên để kiểm tra quyền người duyệt
    const checkQuery = `
      SELECT approver_id, approval_status 
      FROM inspection_header 
      WHERE inspection_id = $1;
    `;
    const checkResult = await pool.query(checkQuery, [inspectionId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phiếu kiểm tra này!",
      });
    }

    const inspection = checkResult.rows[0];

    // 2. 🌟 BƯỚC PHÂN QUYỀN: Kiểm tra nếu KHÔNG PHẢI admin VÀ ID người bấm nút KHÁC approver_id của phiếu
    if (
      // currentUserRole !== "admin" &&
      inspection.approver_id !== currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Bạn không có quyền phê duyệt phiếu này! Phiếu thuộc thẩm quyền của quản lý khác.",
      });
    }

    // 3. 📝 TIẾN HÀNH UPDATE (Nếu vượt qua bước kiểm tra quyền trên)
    const updateQuery = `
      UPDATE inspection_header 
      SET approval_status = $1, approval_comment = $2
      WHERE inspection_id = $3
      RETURNING inspection_id, approval_status;
    `;

    const result = await pool.query(updateQuery, [
      status,
      comment || null,
      inspectionId,
    ]);

    // Trả về cấu trúc thành công đồng bộ với Frontend của bạn
    res.json({ success: true, message: "Cập nhật trạng thái thành công!" });
  } catch (err) {
    console.error("Lỗi API phê duyệt:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getInspectionHeader,
  getInspectionDetail,
  approveInspection,
};
