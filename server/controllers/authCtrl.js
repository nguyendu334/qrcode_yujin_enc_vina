const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // 1. Kiểm tra tài khoản
    const { rows } = await pool.query(
      "SELECT * FROM public.users WHERE username = $1 AND active = true",
      [username]
    );
    if (rows.length === 0)
      return res.status(400).json({ message: "Tài khoản không tồn tại!" });

    const user = rows[0];

    // ĐOẠN KIỂM TRA NHANH (In ra màn hình console của Backend xem dữ liệu lấy từ DB ra là gì)
    // console.log("Mật khẩu người dùng nhập:", password);
    // console.log("Chuỗi Hash lấy từ DB:", user.password_hash || user.password);

    // 2. Định nghĩa đúng tên cột chứa chuỗi mã hóa trong DB của bạn
    // Nếu trong bảng của bạn đặt tên cột là 'password' thì sửa thành user.password
    const dbHash = user.password_hash || user.password;

    if (!dbHash) {
      return res
        .status(500)
        .json({ message: "Lỗi cấu hình cột mật khẩu trong DB!" });
    }

    // 3. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, dbHash);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không chính xác!" });

    // 4. Tạo token cấp quyền nếu khớp
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { login };
