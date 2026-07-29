const axios = require("axios");

// teams
async function sendDirectTeamsMessage(approverEmail, ticketInfo) {
  if (!approverEmail) {
    console.warn("⚠️ Không tìm thấy approverEmail, bỏ qua gửi MS Teams.");
    return;
  }

  try {
    // 1. Tự động xin cấp Access Token từ Azure
    const tokenUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: process.env.AZURE_CLIENT_ID,
      client_secret: process.env.AZURE_CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    });

    const tokenRes = await axios.post(tokenUrl, params);
    const token = tokenRes.data.access_token;

    // Lấy email/User ID của tài khoản gửi (đã khai báo trong .env, ví dụ: SENDER_EMAIL=yjv.it@yujinsmt.com)
    const senderEmail = process.env.SENDER_EMAIL || "yjv-it2@yujinsmt.com";

    // Kiểm tra nếu gửi cho chính mình
    if (senderEmail.toLowerCase() === approverEmail.toLowerCase()) {
      console.warn("⚠️ Không thể tự tạo chat 1-1 với chính tài khoản gửi.");
      return;
    }

    // 2. Tìm User ID của Người gửi và Người nhận
    const [senderRes, recipientRes] = await Promise.all([
      axios.get(`https://graph.microsoft.com/v1.0/users/${senderEmail}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`https://graph.microsoft.com/v1.0/users/${approverEmail}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const senderUserId = senderRes.data.id;
    const recipientUserId = recipientRes.data.id;

    // 3. Mở/Tạo cuộc trò chuyện 1:1
    const chatRes = await axios.post(
      "https://graph.microsoft.com/v1.0/chats",
      {
        chatType: "oneOnOne",
        members: [
          {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            roles: ["owner"],
            "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${senderUserId}')`,
          },
          {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            roles: ["owner"],
            "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${recipientUserId}')`,
          },
        ],
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const chatId = chatRes.data.id;

    // 4. Bắn Activity Notification (Đã sửa đúng định dạng topic.value)
    await axios.post(
      `https://graph.microsoft.com/v1.0/users/${recipientUserId}/teamwork/sendActivityNotification`,
      {
        topic: {
          source: "text",
          value: `🚨 BÁO CÁO SỰ CỐ MỚI: Máy ${ticketInfo.machine_code || ""}`,
          // SỬA DÒNG NÀY: Dùng Teams Deep Link chuẩn bắt đầu bằng https://teams.microsoft.com/l/
          webUrl: `https://teams.microsoft.com/l/chat/${chatId}/0?users=${recipientUserId}`,
        },
        activityType: "userMention",
        previewText: {
          content: `Người báo: ${ticketInfo.reporter_name || "N/A"} - Mức độ: ${ticketInfo.priority || "NORMAL"}`,
        },
        templateParameters: [
          {
            name: "taskId",
            value: ticketInfo.machine_code || "N/A",
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );


    console.log(
      `✅ [Teams Service] Đã gửi tin nhắn riêng tới: ${approverEmail}`,
    );
  } catch (err) {
    console.error(
      "❌ [Teams Service] Lỗi gửi tin nhắn Teams:",
      err.response?.data || err.message,
    );
  }
}

// webhook
// async function sendDirectTeamsMessage(webhookUrl, ticketInfo) {
//   try {
//     // Dữ liệu gửi đi dạng Adaptive Card cực đẹp trên Teams
//     await axios.post(webhookUrl, {
//       type: "message",
//       attachments: [
//         {
//           contentType: "application/vnd.microsoft.card.adaptive",
//           contentUrl: null,
//           content: {
//             $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
//             type: "AdaptiveCard",
//             version: "1.2",
//             body: [
//               {
//                 type: "TextBlock",
//                 text: "🚨 BÁO CÁO SỰ CỐ MỚI",
//                 weight: "Bolder",
//                 size: "Medium",
//                 color: "Attention",
//               },
//               {
//                 type: "FactSet",
//                 facts: [
//                   { title: "Mã máy:", value: ticketInfo.machine_code || "N/A" },
//                   {
//                     title: "Tên máy:",
//                     value: ticketInfo.machine_name || "N/A",
//                   },
//                   { title: "Người báo:", value: ticketInfo.reporter_name },
//                   { title: "Mức độ:", value: ticketInfo.priority },
//                   { title: "Mô tả lỗi:", value: ticketInfo.issue_description },
//                 ],
//               },
//             ],
//           },
//         },
//       ],
//     });
//     console.log("✅ Đã gửi báo cáo thành công qua Teams Webhook!");
//   } catch (err) {
//     console.error("❌ Lỗi gửi Webhook Teams:", err.message);
//   }
// }

module.exports = { sendDirectTeamsMessage };
