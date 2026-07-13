const express = require("express");
const morgan = require('morgan');
const cors = require("cors");
const { pool, testConnection } = require("./config/db");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/api"));

const PORT = process.env.PORT || 5000;
// Hàm khởi động kiểm tra tuần tự
async function start() {
  // Thực hiện kiểm tra kết nối DB trước
  const isDbConnected = await testConnection();

  if (isDbConnected) {
    // Chỉ khi kết nối thành công, server mới mở port và thông báo
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } else {
    console.error("🚨 Hệ thống dừng khởi động do lỗi kết nối Database.");
    process.exit(1); // Dừng chạy server luôn vì không có dữ liệu
  }
}

// Chạy hàm khởi động
start();
