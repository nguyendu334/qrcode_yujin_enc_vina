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

/**
 * Hàm gửi email thông báo sự cố
 * @param {string} toEmail - Email người nhận (Lấy từ DB)
 * @param {Object} ticketInfo - Thông tin chi tiết sự cố
 */
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

module.exports = { sendTicketEmail };
