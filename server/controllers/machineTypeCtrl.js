const { pool } = require("../config/db");

// Endpoint lấy danh sách loại máy (Machine Types)
const getMachineType = async (req, res) => {
  try {
    const query = `
      SELECT 
        mt.machine_type_id, 
        mt.machine_type_name, 
        mt.description,
        ct.frequency,
        ct.approver_id,
        u.full_name AS approver_name
      FROM machine_type mt
      LEFT JOIN checklist_template ct ON mt.machine_type_id = ct.machine_type_id
      LEFT JOIN users u ON ct.approver_id = u.user_id
      ORDER BY mt.machine_type_name ASC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách loại máy" });
  }
};

const addMachineType = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { machine_type_name, description, frequency, approver_id } = req.body;

    // 1. Thêm Kiểu máy
    const machineResult = await client.query(
      `INSERT INTO machine_type (machine_type_name, description)
       VALUES ($1, $2)
       RETURNING machine_type_id`,
      [machine_type_name, description],
    );

    const newId = machineResult.rows[0].machine_type_id;

    // 2. Tự động thêm bản ghi vào checklist_template trùng ID
    await client.query(
      `INSERT INTO checklist_template (
        template_id, template_name, machine_type_id, version, active, frequency, approver_id
       )
       VALUES ($1, $2, $3, 1, true, $4, $5)`,
      [newId, machine_type_name, newId, frequency, approver_id],
    );

    await client.query("COMMIT");
    res.status(201).json({
      message: "Thành công!",
      machine_type_id: newId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Lỗi Controller addMachineType:", err.message);
    res
      .status(500)
      .json({ error: "Lỗi server khi lưu kiểu máy và checklist template" });
  } finally {
    client.release();
  }
};

const updateMachineType = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // machine_type_id từ URL
    const { machine_type_name, description, frequency, approver_id } = req.body;

    await client.query("BEGIN");

    // 1. Cập nhật bảng machine_type
    const updateMachineQuery = `
      UPDATE machine_type 
      SET machine_type_name = $1, description = $2 
      WHERE machine_type_id = $3
    `;
    await client.query(updateMachineQuery, [
      machine_type_name,
      description,
      id,
    ]);

    // 2. Cập nhật bảng checklist_template tương ứng
    const updateTemplateQuery = `
      UPDATE checklist_template 
      SET template_name = $1, frequency = $2, approver_id = $3 
      WHERE machine_type_id = $4
    `;
    await client.query(updateTemplateQuery, [
      machine_type_name,
      frequency,
      approver_id,
      id,
    ]);

    await client.query("COMMIT");
    res.json({
      message: "Cập nhật kiểu máy và checklist template thành công!",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Lỗi khi cập nhật kiểu máy:", err.message);
    res.status(500).json({ error: "Lỗi server khi cập nhật kiểu máy" });
  } finally {
    client.release();
  }
};

const deleteMachineType = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // machine_type_id từ URL

    await client.query("BEGIN");

    // 1. Xóa bản ghi trong checklist_template trước
    await client.query(
      "DELETE FROM checklist_template WHERE machine_type_id = $1",
      [id],
    );

    // 2. Xóa kiểu máy trong machine_type
    const result = await client.query(
      "DELETE FROM machine_type WHERE machine_type_id = $1",
      [id],
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "Không tìm thấy kiểu máy cần xóa!" });
    }

    await client.query("COMMIT");
    res.json({ message: "Xóa kiểu máy thành công!" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Lỗi khi xóa kiểu máy:", err.message);
    res
      .status(500)
      .json({ error: "Không thể xóa kiểu máy do đang có dữ liệu liên kết!" });
  } finally {
    client.release();
  }
};

module.exports = {
  getMachineType,
  addMachineType,
  updateMachineType,
  deleteMachineType,
};
