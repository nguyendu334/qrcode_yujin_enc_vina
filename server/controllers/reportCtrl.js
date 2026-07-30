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
        h.shift, -- 🌟 BỔ SUNG: Trường Ca làm việc (Ví dụ: 'Ca ngày' / 'Ca đêm' hoặc 'N' / 'Đ')
        d.result,
        d.value,
        u.full_name AS approver_name
      FROM checklist_item c
      JOIN inspection_header h ON h.machine_id = $1 
        AND TO_CHAR(h.inspection_date, 'YYYY-MM') = $2
        AND h.approval_status = 'approved'
      JOIN inspection_detail d ON h.inspection_id = d.inspection_id AND c.item_id = d.item_id
      LEFT JOIN users u ON h.approver_id = u.user_id
      ORDER BY c.display_order ASC, c.item_id ASC, day_num ASC;
    `;

    const result = await pool.query(query, [machine_id, year_month]);

    // 🌟 XỬ LÝ NHÓM DỮ LIỆU (GROUP BY ITEM_ID) TRƯỚC KHI TRẢ VỀ FRONTEND
    // const groupedMap = new Map();

    // result.rows.forEach((row) => {
    //   // Nếu chưa có item_id này trong Map thì tạo mới
    //   if (!groupedMap.has(row.item_id)) {
    //     groupedMap.set(row.item_id, {
    //       item_id: row.item_id,
    //       item_name: row.item_name,
    //       standard_value: row.standard_value,
    //       item_type: row.item_type,
    //       min_value: row.min_value,
    //       max_value: row.max_value,
    //       days: {}, // Nơi chứa kết quả theo từng ngày và ca
    //       approver_name: row.approver_name || null, // Thêm tên người duyệt
    //     });
    //   }

    //   const currentItem = groupedMap.get(row.item_id);
    //   const day = row.day_num;

    //   if (!currentItem.days[day]) {
    //     currentItem.days[day] = {};
    //   }

    //   // Giá trị thực tế cần hiển thị: ưu tiên giá trị số (value), nếu không có thì lấy result (OK/NG)
    //   const displayVal =
    //     row.item_type === "NUMBER" &&
    //     row.value !== null &&
    //     row.value !== undefined
    //       ? row.value
    //       : row.result;

    //   // Chuẩn hóa tên Ca làm việc thành 'day' hoặc 'night'
    //   const shiftStr = String(row.shift || "").toLowerCase();
    //   if (
    //     shiftStr.includes("ngày") ||
    //     shiftStr.includes("day") ||
    //     shiftStr === "n"
    //   ) {
    //     currentItem.days[day].day = displayVal;
    //   } else {
    //     currentItem.days[day].night = displayVal;
    //   }
    // });

    // // Chuyển Map thành Mảng gửi về Client
    // const reportData = Array.from(groupedMap.values());

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
