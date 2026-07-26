const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const { testConnection } = require("./config/db");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
morgan.token("time", () => {
  return new Date().toLocaleTimeString("vi-VN", { hour12: false });
});

app.use(
  morgan(
    "[:time] :method :url :status :response-time ms - :res[content-length]"
  )
);

// API
app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/api"));

// React build
app.use(express.static(path.join(__dirname, "../client/dist")));

app.use((req, res, next) => {
  // Nếu là API thì trả 404, không chuyển sang React
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API not found" });
  }

  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const PORT = process.env.PORT || 5000;

async function start() {
  const isDbConnected = await testConnection();

  if (isDbConnected) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } else {
    console.error("🚨 Hệ thống dừng khởi động do lỗi kết nối Database.");
    process.exit(1);
  }
}

start();
