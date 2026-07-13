const { pool } = require("../config/db");

// API lấy thông tin khu vực
const getAreas = async (req, res) => {
  try {
    // Thay đổi tên bảng hoặc tên cột tương ứng với database của bạn
    const result = await pool.query(
      `select area_id, area_name FROM area ORDER BY area_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách khu vực" });
  }
};

module.exports = { getAreas };
