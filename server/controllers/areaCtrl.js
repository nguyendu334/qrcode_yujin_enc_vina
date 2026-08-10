const { pool } = require("../config/db");

// API lấy thông tin khu vực
const getAreas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.area_id, 
        a.area_name, 
        a.department_id, 
        d.department_name
      FROM area a
      LEFT JOIN department d ON a.department_id = d.department_id
      ORDER BY a.area_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách khu vực" });
  }
};

module.exports = { getAreas };
