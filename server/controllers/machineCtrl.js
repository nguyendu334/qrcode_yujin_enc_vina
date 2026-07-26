const { pool } = require("../config/db");

// API lấy danh sách máy móc
const getMachines = async (req, res) => {
  try {
    const { rows } = await pool.query(`
        SELECT 
          m.machine_id,
          m.machine_code,
          m.machine_name,
          m.line_no,
          m.active,
          m.area_id,
          m.machine_type_id,
          a.area_name,
          t.machine_type_name,
          u.full_name AS approver_name
        FROM machine m
        LEFT JOIN area a ON m.area_id = a.area_id
        LEFT JOIN machine_type t ON m.machine_type_id = t.machine_type_id
        LEFT JOIN checklist_template ct ON m.machine_type_id = ct.machine_type_id
        LEFT JOIN users u ON ct.approver_id = u.user_id
        ORDER BY m.machine_code ASC;
      `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API: Thêm máy mới (Chỉ quản lý/admin được thêm)
const addMachine = async (req, res) => {
  try {
    const {
      machine_code,
      machine_name,
      machine_type_id,
      area_id,
      line_no,
      active,
    } = req.body;

    // 1. Kiểm tra các trường bắt buộc không được để trống
    if (
      !machine_code ||
      !machine_name ||
      !machine_type_id ||
      !area_id ||
      !line_no
    ) {
      return res.status(400).json({
        error: "Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc",
      });
    }

    // 2. Ép kiểu dữ liệu sang Number đề phòng dữ liệu từ Frontend gửi lên dạng String
    const typeIdParsed = parseInt(machine_type_id, 10);
    const areaIdParsed = parseInt(area_id, 10);
    const isActive = active === true || active === "true";

    // 3. Kiểm tra xem mã máy (machine_code) đã tồn tại trong hệ thống chưa
    const checkDuplicate = await pool.query(
      "SELECT machine_id FROM machine WHERE UPPER(machine_code) = UPPER($1)",
      [machine_code.trim()]
    );
    if (checkDuplicate.rows.length > 0) {
      return res.status(400).json({
        error: `Mã máy [${machine_code.toUpperCase()}] đã tồn tại trong hệ thống!`,
      });
    }

    // 4. Tiến hành chèn dữ liệu mới vào Postgres
    const queryText = `
        INSERT INTO machine (machine_code, machine_name, machine_type_id, area_id, line_no, active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
    const values = [
      machine_code.trim().toUpperCase(),
      machine_name.trim(),
      typeIdParsed,
      areaIdParsed,
      line_no.trim(),
      isActive,
    ];

    const result = await pool.query(queryText, values);

    // Trả về kết quả thành công
    res.status(201).json({
      message: "Thêm máy mới thành công",
      machine: result.rows[0],
    });
  } catch (err) {
    console.error("Lỗi API POST /machines:", err.message);
    res.status(500).json({ error: "Lỗi server khi thêm thiết bị mới" });
  }
};

//API xoá máy
const deleteMachine = async (req, res) => {
  try {
    const machineId = req.params.id;

    // 1. Kiểm tra xem ID truyền lên có hợp lệ không
    if (!machineId) {
      return res.status(400).json({ error: "Thiếu ID thiết bị cần xoá" });
    }

    // 2. [Tùy chọn bảo mật/ràng buộc] Kiểm tra xem máy này có đang dính dữ liệu lịch sử checksheet không
    // Nếu bảng checksheet của bạn có khóa ngoại tham chiếu tới machine_id, việc xóa trực tiếp sẽ bị lỗi DB Constraint.
    // Bạn có thể kiểm tra trước hoặc dùng cơ chế CASCADE/SOFT DELETE. Ở đây là lệnh kiểm tra cơ bản:
    /*
      const checkChecksheet = await db.query('SELECT id FROM checksheet_logs WHERE machine_id = $1 LIMIT 1', [machineId]);
      if (checkChecksheet.rows.length > 0) {
        return res.status(400).json({ error: 'Không thể xoá máy này vì đã có dữ liệu lịch sử Checksheet liên quan!' });
      }
      */

    // 3. Thực hiện lệnh xóa trong Database
    const result = await pool.query(
      "DELETE FROM machine WHERE machine_id = $1 RETURNING *",
      [machineId]
    );

    // 4. Kiểm tra xem có bản ghi nào thực sự bị xóa không (đề phòng ID không tồn tại)
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy thiết bị với ID này để xoá" });
    }

    // Trả về thông báo thành công
    res.json({
      message: `Đã xoá thành công máy [${result.rows[0].machine_code}] khỏi hệ thống`,
    });
  } catch (err) {
    console.error("Lỗi API DELETE /machines:", err.message);
    // Bắt lỗi ràng buộc khóa ngoại (Foreign Key Constraint) của Postgres
    if (err.code === "23503") {
      return res.status(400).json({
        error:
          "Không thể xoá máy do đang có dữ liệu cấu hình hoặc lịch sử checksheet liên quan đến máy này.",
      });
    }
    res.status(500).json({ error: "Lỗi server khi tiến hành xoá thiết bị" });
  }
};

// API cập nhật thông tin máy
const updateMachine = async (req, res) => {
  try {
    const machineId = req.params.id;
    const {
      machine_code,
      machine_name,
      machine_type_id,
      area_id,
      line_no,
      active,
    } = req.body;

    // 1. Kiểm tra ID máy trên URL có tồn tại không
    if (!machineId) {
      return res.status(400).json({ error: "Thiếu ID máy cần cập nhật" });
    }

    // 2. Kiểm tra các trường thông tin bắt buộc
    if (
      !machine_code ||
      !machine_name ||
      !machine_type_id ||
      !area_id ||
      !line_no
    ) {
      return res
        .status(400)
        .json({ error: "Vui lòng điền đầy đủ thông tin bắt buộc" });
    }

    // 3. Ép kiểu dữ liệu sang Number/Boolean để khớp với cấu trúc Database của Postgres
    const typeIdParsed = parseInt(machine_type_id, 10);
    const areaIdParsed = parseInt(area_id, 10);
    const isActive = active === true || active === "true";

    // 4. Kiểm tra trùng lặp mã máy (Đảm bảo không sửa mã máy thành một mã đã tồn tại của máy khác)
    const checkDuplicate = await pool.query(
      "SELECT machine_id FROM machine WHERE UPPER(machine_code) = UPPER($1) AND machine_id <> $2",
      [machine_code.trim(), machineId]
    );
    if (checkDuplicate.rows.length > 0) {
      return res.status(400).json({
        error: `Mã máy [${machine_code.toUpperCase()}] đã được sử dụng bởi thiết bị khác!`,
      });
    }

    // 5. Thực hiện câu lệnh UPDATE trong Postgres
    const queryText = `
        UPDATE machine 
        SET 
          machine_code = $1, 
          machine_name = $2, 
          machine_type_id = $3, 
          area_id = $4, 
          line_no = $5, 
          active = $6
        WHERE machine_id = $7
        RETURNING *;
      `;
    const values = [
      machine_code.trim().toUpperCase(),
      machine_name.trim(),
      typeIdParsed,
      areaIdParsed,
      line_no.trim(),
      isActive,
      machineId,
    ];

    const result = await pool.query(queryText, values);

    // 6. Kiểm tra xem thiết bị có tồn tại trong hệ thống để cập nhật không
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy thiết bị để cập nhật" });
    }

    // Trả dữ liệu thành công về cho Frontend
    res.json({
      message: "Cập nhật thông tin máy thành công",
      machine: result.rows[0],
    });
  } catch (err) {
    console.error("Lỗi API PUT /machines:", err.message);
    res.status(500).json({ error: "Lỗi server khi cập nhật thông tin máy" });
  }
};

module.exports = { getMachines, addMachine, deleteMachine, updateMachine };
