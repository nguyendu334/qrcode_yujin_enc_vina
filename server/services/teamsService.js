// const axios = require("axios");

// /**
//  * Hàm gửi tin nhắn Teams 1:1 trực tiếp tới người phụ trách
//  * @param {string} approverEmail - Email người nhận (Lấy từ DB)
//  * @param {Object} ticketInfo - Thông tin chi tiết sự cố
//  */
// async function sendDirectTeamsMessage(approverEmail, ticketInfo) {
//   if (!approverEmail) {
//     console.warn("⚠️ Không tìm thấy approverEmail, bỏ qua gửi MS Teams.");
//     return;
//   }

//   try {
//     // 1. Tự động xin cấp Access Token từ Azure
//     const tokenUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;
//     const params = new URLSearchParams({
//       client_id: process.env.AZURE_CLIENT_ID,
//       client_secret: process.env.AZURE_CLIENT_SECRET,
//       scope: "https://graph.microsoft.com/.default",
//       grant_type: "client_credentials",
//     });

//     const tokenRes = await axios.post(tokenUrl, params);
//     const token = tokenRes.data.access_token;

//     // 2. Tìm User ID dựa theo Email
//     const userRes = await axios.get(
//       `https://graph.microsoft.com/v1.0/users/${approverEmail}`,
//       { headers: { Authorization: `Bearer ${token}` } },
//     );
//     const userId = userRes.data.id;

//     // 3. Mở/Tạo cuộc trò chuyện 1:1
//     const chatRes = await axios.post(
//       "https://graph.microsoft.com/v1.0/chats",
//       {
//         chatType: "oneOnOne",
//         members: [
//           {
//             "@odata.type": "#microsoft.graph.aadUserConversationMember",
//             roles: ["owner"],
//             "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${userId}')`,
//           },
//         ],
//       },
//       { headers: { Authorization: `Bearer ${token}` } },
//     );

//     // 4. Bắn tin nhắn trực tiếp
//     await axios.post(
//       `https://graph.microsoft.com/v1.0/chats/${chatRes.data.id}/messages`,
//       {
//         body: {
//           contentType: "html",
//           content: `
//             <div style="border-left: 4px solid #ef4444; padding-left: 12px; font-family: sans-serif;">
//               <h3 style="color: #ef4444; margin-top:0;">🚨 BÁO CÁO SỰ CỐ MỚI</h3>
//               <p><b>Mã máy:</b> ${ticketInfo.machine_code || "N/A"}</p>
//               <p><b>Tên máy:</b> ${ticketInfo.machine_name || "N/A"} (${ticketInfo.line_no || "N/A"})</p>
//               <p><b>Người báo:</b> ${ticketInfo.reporter_name}</p>
//               <p><b>Mức độ:</b> <b style="color: red;">${ticketInfo.priority}</b></p>
//               <p><b>Mô tả lỗi:</b> ${ticketInfo.issue_description}</p>
//               <p><i>Vui lòng truy cập hệ thống để tiếp nhận xử lý!</i></p>
//             </div>
//           `,
//         },
//       },
//       { headers: { Authorization: `Bearer ${token}` } },
//     );

//     console.log(
//       `✅ [Teams Service] Đã gửi tin nhắn riêng tới: ${approverEmail}`,
//     );
//   } catch (err) {
//     console.error(
//       "❌ [Teams Service] Lỗi gửi tin nhắn Teams:",
//       err.response?.data || err.message,
//     );
//   }
// }

// module.exports = { sendDirectTeamsMessage };

const axios = require("axios");

async function sendDirectTeamsMessage(webhookUrl, ticketInfo) {
  try {
    // Dữ liệu gửi đi dạng Adaptive Card cực đẹp trên Teams
    await axios.post(webhookUrl, {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          contentUrl: null,
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.2",
            body: [
              {
                type: "TextBlock",
                text: "🚨 BÁO CÁO SỰ CỐ MỚI",
                weight: "Bolder",
                size: "Medium",
                color: "Attention",
              },
              {
                type: "FactSet",
                facts: [
                  { title: "Mã máy:", value: ticketInfo.machine_code || "N/A" },
                  {
                    title: "Tên máy:",
                    value: ticketInfo.machine_name || "N/A",
                  },
                  { title: "Người báo:", value: ticketInfo.reporter_name },
                  { title: "Mức độ:", value: ticketInfo.priority },
                  { title: "Mô tả lỗi:", value: ticketInfo.issue_description },
                ],
              },
            ],
          },
        },
      ],
    });
    console.log("✅ Đã gửi báo cáo thành công qua Teams Webhook!");
  } catch (err) {
    console.error("❌ Lỗi gửi Webhook Teams:", err.message);
  }
}

module.exports = { sendDirectTeamsMessage };

