// 1. Lấy danh sách hạng mục theo template_id
const { pool } = require("../config/db");

const getChecklistTemplates = async (req, res) => {
  try {
    const query = `
      SELECT template_id, template_name, machine_type_id 
      FROM checklist_template 
      ORDER BY template_id ASC;
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Lỗi getChecklistTemplates:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getItemsByTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const query = `
      SELECT 
        item_id, 
        template_id, 
        item_name, 
        item_type, 
        standard_value, 
        unit, 
        min_value, 
        max_value, 
        display_order
      FROM checklist_item
      WHERE template_id = $1
      ORDER BY display_order ASC, item_id ASC;
    `;
    const result = await pool.query(query, [templateId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Thêm hạng mục mới
const createItem = async (req, res) => {
  try {
    const {
      template_id,
      item_name,
      item_type,
      standard_value,
      unit,
      min_value,
      max_value,
      display_order,
    } = req.body;

    const query = `
      INSERT INTO checklist_item (
        template_id, item_name, item_type, standard_value, unit, min_value, max_value, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      template_id,
      item_name,
      item_type || "OK_NG",
      standard_value || null,
      unit || null,
      min_value !== "" ? min_value : null,
      max_value !== "" ? max_value : null,
      display_order || 1,
    ]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Cập nhật hạng mục
const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const {
      item_name,
      item_type,
      standard_value,
      unit,
      min_value,
      max_value,
      display_order,
    } = req.body;

    const query = `
      UPDATE checklist_item
      SET 
        item_name = $1, 
        item_type = $2, 
        standard_value = $3, 
        unit = $4, 
        min_value = $5, 
        max_value = $6, 
        display_order = $7
      WHERE item_id = $8
      RETURNING *;
    `;
    const result = await pool.query(query, [
      item_name,
      item_type,
      standard_value || null,
      unit || null,
      min_value !== "" ? min_value : null,
      max_value !== "" ? max_value : null,
      display_order,
      itemId,
    ]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Xóa hạng mục
const deleteItem = async (req, res) => {
  const client = await pool.connect();
  try {
    const { itemId } = req.params;

    await client.query("BEGIN");

    // 1. Lấy template_id và display_order của mục sắp xóa
    const itemQuery = await client.query(
      `SELECT template_id, display_order FROM checklist_item WHERE item_id = $1`,
      [itemId],
    );

    if (itemQuery.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy hạng mục!" });
    }

    const { template_id, display_order } = itemQuery.rows[0];

    // 2. Xóa hạng mục
    await client.query(`DELETE FROM checklist_item WHERE item_id = $1`, [
      itemId,
    ]);

    // 3. Giảm display_order của tất cả các mục phía sau đi 1 đơn vị
    await client.query(
      `UPDATE checklist_item 
       SET display_order = display_order - 1 
       WHERE template_id = $1 AND display_order > $2`,
      [template_id, display_order],
    );

    await client.query("COMMIT");
    res.json({
      success: true,
      message: "Đã xóa và sắp xếp lại thứ tự thành công!",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

module.exports = {
  getChecklistTemplates,
  getItemsByTemplate,
  createItem,
  updateItem,
  deleteItem,
};
