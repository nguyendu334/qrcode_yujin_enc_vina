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

const addArea = async (req, res) => {
  const { area_name, department_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO area (area_name, department_id)
        VALUES ($1, $2)
        RETURNING *`,
      [area_name, department_id],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi server khi thêm khu vực" });
  }
};

const updateArea = async (req, res) => {
  const { area_id } = req.params;
  const { area_name, department_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE area
        SET area_name = $1, department_id = $2
        WHERE area_id = $3
        RETURNING *`,
      [area_name, department_id, area_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Khu vực không tồn tại" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi server khi cập nhật khu vực" });
  }
};

const deleteArea = async (req, res) => {
  const { area_id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM area
        WHERE area_id = $1
        RETURNING *`,
      [area_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Khu vực không tồn tại" });
    }
    res.json({ message: "Xóa khu vực thành công" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi server khi xóa khu vực" });
  }
};

module.exports = { getAreas, addArea, updateArea, deleteArea };
