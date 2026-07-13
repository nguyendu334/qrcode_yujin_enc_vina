const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");

// API lấy danh sách user
const getUesrs = async (req, res) => {
  try {
    // Chỉ lấy chính xác 5 cột cơ bản này để khớp hoàn toàn với ảnh DB của bạn, bỏ qua created_at để test
    const result = await pool.query(
      `SELECT 
        u.user_id, 
        u.username, 
        u.full_name, 
        u.role, 
        u.active, 
        u.email, 
        u.department_id,
        d.department_name -- Lấy chính xác tên phòng ban từ bảng department
       FROM users u
       LEFT JOIN department d ON u.department_id = d.department_id
       ORDER BY u.user_id DESC`
    );

    // Trả dữ liệu về cho Frontend
    res.json(result.rows);
  } catch (err) {
    // Thêm dòng console.log này để xem chính xác lỗi ở Terminal Backend là gì (ví dụ: cột không tồn tại, sai tên bảng...)
    console.error("Lỗi Postgres chi tiết:", err.message);

    res.status(500).json({ error: err.message });
  }
};

// API: Thêm người dùng mới
const addUser = async (req, res) => {
  // 1. Thay đổi 'department' thành 'department_id' nhận về từ Frontend
  const { username, password, full_name, role, active, email, department_id } =
    req.body;

  try {
    // Kiểm tra xem trùng username không
    const userExist = await pool.query(
      "SELECT user_id FROM users WHERE username = $1",
      [username]
    );
    if (userExist.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Tên tài khoản (username) này đã tồn tại!" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 2. Ép kiểu department_id sang số nguyên (Integer) một cách an toàn
    const parsedDepartmentId = department_id
      ? parseInt(department_id, 10)
      : null;

    // 3. Thay thế cột 'department' thành 'department_id' trong câu lệnh INSERT
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role, active, email, department_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING user_id, username, full_name, role, active, email, department_id`,
      [
        username,
        passwordHash,
        full_name,
        role,
        active ?? true, // Mặc định trạng thái là đang hoạt động (true) nếu không truyền
        email,
        parsedDepartmentId, // Truyền đúng giá trị Số nguyên (hoặc null nếu trống) vào $7
      ]
    );

    res
      .status(201)
      .json({ message: "Thêm người dùng thành công!", data: result.rows[0] });
  } catch (err) {
    console.error("Lỗi thêm người dùng:", err.message);
    res.status(500).json({ error: err.message });
  }
};

//API xoá máy
const deleteUser = async (req, res) => {
  const { user_id } = req.params; // Nhận đúng tham số từ URL truyền vào

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING user_id",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng để xóa!" });
    }

    res.json({ message: "Xóa người dùng thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API cập nhật thông tin máy
const updateUser = async (req, res) => {
  const userIdParsed = parseInt(req.params.user_id, 10);

  if (isNaN(userIdParsed)) {
    return res.status(400).json({ message: "ID người dùng không hợp lệ!" });
  }

  // 2. Lấy các dữ liệu cần sửa từ body gửi lên
  const { username, full_name, role, active, email, department_id } = req.body;

  try {
    // 3. Chạy câu lệnh UPDATE với đúng tên cột user_id trong Postgres
    const result = await pool.query(
      `UPDATE users 
       SET username = $1, full_name = $2, role = $3, active = $4, email = $5, department_id = $6 
       WHERE user_id = $7 
       RETURNING user_id, username, full_name, role, active, email, department_id`,
      [
        username,
        full_name,
        role,
        active,
        email,
        department_id ? parseInt(department_id, 10) : null,
        userIdParsed,
      ]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng để cập nhật!" });
    }

    res.json({
      message: "Cập nhật thông tin người dùng thành công!",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Lỗi cập nhật:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getUesrs, addUser, deleteUser, updateUser };
