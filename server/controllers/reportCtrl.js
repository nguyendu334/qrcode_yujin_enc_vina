const { pool } = require("../config/db");

const getMonthlyReport = async (req, res) => {
  const { machine_id, year_month } = req.query;
  // params truyền lên ví dụ: machine_id=22 và year_month="2026-07"

  if (!machine_id || !year_month) {
    return res.status(400).json({
      success: false,
      error: "Thiếu thông tin machine_id hoặc tháng báo cáo (year_month)!",
    });
  }

  try {
    const query = `
      SELECT 
    c.item_id,
    c.item_name,
    c.standard_value,
    c.item_type,
    c.min_value,  
    c.max_value,  
    EXTRACT(DAY FROM h.inspection_date)::int AS day_num,
    d.result,
    u.full_name AS approver_name,
    d.value -- 🌟 BỔ SUNG: Lấy thêm trường giá trị số thực tế đo được
  FROM checklist_item c
  JOIN inspection_header h ON h.machine_id = $1 
    AND TO_CHAR(h.inspection_date, 'YYYY-MM') = $2
    AND h.approval_status = 'approved'
  JOIN inspection_detail d ON h.inspection_id = d.inspection_id AND c.item_id = d.item_id
  LEFT JOIN users u ON h.approver_id = u.user_id
  ORDER BY c.display_order ASC, c.item_id ASC, day_num ASC;
    `;

    const result = await pool.query(query, [machine_id, year_month]);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("Lỗi khi lấy báo cáo tháng:", err);
    return res.status(500).json({
      success: false,
      error: "Lỗi hệ thống khi xử lý dữ liệu báo cáo!",
    });
  }
};

module.exports = {
  getMonthlyReport,
};
