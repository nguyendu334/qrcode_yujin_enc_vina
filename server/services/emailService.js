const nodemailer = require("nodemailer");

// 1. Khởi tạo Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true cho port 465, false cho các port khác
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTicketEmail(toEmail, ticketInfo) {
  if (!toEmail) {
    console.warn("⚠️ Không tìm thấy Email người nhận, bỏ qua gửi Email.");
    return;
  }

  try {
    // 2. Nội dung Email dạng HTML
    const mailOptions = {
      from: `"Hệ Thống Báo Lỗi Máy" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `[BÁO SỰ CỐ] Máy ${ticketInfo.machine_code || ""} - Mức độ: ${ticketInfo.priority || "NORMAL"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #ef4444; color: white; padding: 16px; text-align: center;">
            <h2 style="margin: 0;">🚨 THÔNG BÁO SỰ CỐ MỚI</h2>
          </div>
          <div style="padding: 20px; color: #334155;">
            <p>Hệ thống vừa nhận được báo cáo sự cố máy với thông tin chi tiết như sau:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 35%; border-bottom: 1px solid #f1f5f9;">Mã máy:</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${ticketInfo.machine_code || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Tên máy:</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${ticketInfo.machine_name || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Vị trí / Line:</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${ticketInfo.line_no || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Người báo cáo:</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${ticketInfo.reporter_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Mức độ ưu tiên:</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: red; font-weight: bold;">${ticketInfo.priority || "NORMAL"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Mô tả lỗi:</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${ticketInfo.issue_description}</td>
              </tr>
            </table>
            <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
              <i>Vui lòng đăng nhập hệ thống quản lý để tiếp nhận và cập nhật tiến độ xử lý.</i>
            </p>
          </div>
        </div>
      `,
    };

    // 3. Tiến hành gửi mail
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ [Email Service] Đã gửi mail thành công tới: ${toEmail} (ID: ${info.messageId})`,
    );
  } catch (err) {
    console.error("❌ [Email Service] Lỗi gửi Email:", err.message);
  }
}

// Send checksheet result email
async function sendChecksheetEmail(toEmail, data) {
  if (!toEmail) return;

  // Kiểm tra xem bài checksheet có mục nào bị NG không
  const hasNG = data.check_results.some(
    (item) => item.result && item.result.toUpperCase() === "NG",
  );
  const statusBadge = hasNG
    ? '<span style="color: #ef4444; font-weight: bold;">⚠️ BẤT THƯỜNG (NG)</span>'
    : '<span style="color: #10b981; font-weight: bold;">✅ BÌNH THƯỜNG (OK)</span>';

  const mailOptions = {
    from: `"Hệ Thống Checksheet" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `[CHECKSHEET] Phiếu kiểm tra mới máy ${data.machine_name || data.machine_id} - Ca ${data.shift}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 0 auto;">
        <h2 style="color: #2563eb; margin-top: 0;">📋 THÔNG BÁO NỘP PHIẾU CHECKSHEET</h2>
        <p>Xin chào, hệ thống vừa nhận được một phiếu kiểm tra thiết bị mới cần xác nhận:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0; background-color: #f8fafc;">
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Mã thiết bị:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${data.machine_name || data.machine_id}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Người kiểm tra:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${data.inspector}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Ca làm việc:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">Ca ${data.shift}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Ngày kiểm tra:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${data.inspection_date}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Đánh giá tổng quan:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${statusBadge}</td>
          </tr>
        </table>

        <p>Vui lòng truy cập hệ thống để xem chi tiết kết quả kiểm tra và phê duyệt.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">Email tự động từ hệ thống quản lý thiết bị.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendTicketEmail, sendChecksheetEmail };
