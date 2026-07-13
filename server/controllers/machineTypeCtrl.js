const { pool } = require("../config/db");

// Endpoint lấy danh sách loại máy (Machine Types)
const getMachineType = async (req, res) => {
    try {
      // Thay đổi tên bảng hoặc tên cột tương ứng với database của bạn
      const result = await pool.query(
        "SELECT machine_type_id, machine_type_name FROM machine_type ORDER BY machine_type_name ASC"
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Lỗi server khi lấy danh sách loại máy" });
    }
  };

  module.exports = { getMachineType }