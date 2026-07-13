const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 2. Hàm tự động chạy kiểm tra kết nối (Self-Invoking / IIFE)
async function testConnection() {
  try {
    console.log("🔄 [Database] Đang kiểm tra kết nối tới PostgreSQL...");
    const client = await pool.connect();
    await client.query("SELECT 1");
    console.log("✅ [Database] Kết nối Cơ sở dữ liệu thành công!");
    client.release();
    return true;
  } catch (err) {
    console.error("❌ [Database] LỖI: Không thể kết nối tới Cơ sở dữ liệu!");
    console.error(
      "------------------------------------------------------------"
    );
    console.error("Mã lỗi chi tiết:", err.message);
    if (err.code === "28P01") {
      console.error(
        "👉 Gợi ý: Sai mật khẩu (password authentication failed) trong file .env"
      );
    } else if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
      console.error(
        `👉 Gợi ý: Địa chỉ IP ${process.env.DB_HOST} hoặc PORT không phản hồi. Hãy kiểm tra mạng hoặc dịch vụ Postgres.`
      );
    }
    console.error(
      "------------------------------------------------------------"
    );
    return false;
  }
}

module.exports = { pool, testConnection };
