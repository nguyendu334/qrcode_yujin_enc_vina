// controllers/ticketController.js
const { pool } = require("../config/db");
// const { sendDirectTeamsMessage } = require("../services/teamsService");
const { sendTicketEmail } = require("../services/emailService");

const createTicket = async (req, res) => {
  const { machine_id, reporter_name, issue_description, priority } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!machine_id || !reporter_name || !issue_description) {
    return res
      .status(400)
      .json({ error: "Vui lòng nhập đầy đủ thông tin sự cố bắt buộc!" });
  }

  try {
    const query = `
      INSERT INTO maintenance_ticket (machine_id, reporter_name, issue_description, priority, status)
      VALUES ($1, $2, $3, $4, 'PENDING')
      RETURNING ticket_id, created_at;
    `;

    const result = await pool.query(query, [
      machine_id,
      reporter_name,
      issue_description,
      priority || "NORMAL",
    ]);

    res.status(201).json({
      success: true,
      message: "Gửi yêu cầu sửa chữa (Ticket) thành công!",
      ticket_id: result.rows[0].ticket_id,
    });

// Send Teams
    // try {
    //   const getDetailQuery = `
    //     SELECT
    //       m.machine_code,
    //       m.machine_name,
    //       m.line_no,
    //       ct.approver_id,
    //       u.full_name AS approver_name,
    //       u.email AS approver_email
    //     FROM machine m
    //     JOIN machine_type mt ON m.machine_type_id = mt.machine_type_id
    //     JOIN checklist_template ct ON mt.machine_type_id = ct.machine_type_id
    //     LEFT JOIN users u ON ct.approver_id = u.user_id -- (Giả định bạn có bảng users, nếu có)
    //     WHERE m.machine_id = $1
    //     LIMIT 1;
    //   `;

    //   const detailRes = await pool.query(getDetailQuery, [machine_id]);

    //   const info = detailRes.rows[0] || {};
    //   console.log(info.approver_email);
    //   if (info.approver_email) {
    //     sendDirectTeamsMessage(info.approver_email, {
    //       machine_code: info.machine_code,
    //       machine_name: info.machine_name,
    //       line_no: info.line_no,
    //       reporter_name,
    //       issue_description,
    //       priority: priority || "NORMAL",
    //     });
    //   }
    // } catch (bgErr) {
    //   console.error("Lỗi lấy thông tin máy gửi Teams:", bgErr.message);
    // }

// Webhook
    // try {
    //   const getDetailQuery = `
    //     SELECT machine_code, machine_name, line_no
    //     FROM machine
    //     WHERE machine_id = $1
    //   `;
    //   const detailRes = await pool.query(getDetailQuery, [machine_id]);
    //   const machineInfo = detailRes.rows[0] || {};

    //   // Lấy URL Webhook (Lấy từ .env hoặc từ cột webhook trong DB)
    //   const targetWebhookUrl = process.env.TEAMS_WEBHOOK_URL;

    //   sendDirectTeamsMessage(targetWebhookUrl, {
    //     machine_code: machineInfo.machine_code,
    //     machine_name: machineInfo.machine_name,
    //     line_no: machineInfo.line_no,
    //     reporter_name,
    //     issue_description,
    //     priority: priority || "NORMAL",
    //   });
    // } catch (bgErr) {
    //   console.error("Lỗi lấy thông tin máy gửi Webhook:", bgErr.message);
    // }

// Send mail
    try {
      const getDetailQuery = `
        SELECT 
          m.machine_code,
          m.machine_name,
          m.line_no,
          u.email AS approver_email
        FROM machine m
        JOIN machine_type mt ON m.machine_type_id = mt.machine_type_id
        JOIN checklist_template ct ON mt.machine_type_id = ct.machine_type_id
        LEFT JOIN users u ON ct.approver_id = u.user_id
        WHERE m.machine_id = $1
        LIMIT 1;
      `;

      const detailRes = await pool.query(getDetailQuery, [machine_id]);
      const info = detailRes.rows[0] || {};

      // Gọi hàm gửi Email
      if (info.approver_email) {
        sendTicketEmail(info.approver_email, {
          machine_code: info.machine_code,
          machine_name: info.machine_name,
          line_no: info.line_no,
          reporter_name,
          issue_description,
          priority: priority || "NORMAL",
        });
      }
    } catch (bgErr) {
      console.error("Lỗi gửi email chạy ngầm:", bgErr.message);
    }
  } catch (err) {
    console.error("Lỗi tạo ticket sự cố:", err.message);
    res.status(500).json({ error: "Lỗi hệ thống khi gửi yêu cầu hỗ trợ!" });
  }
};

// 1. API: Lấy danh sách ticket (có kèm thông tin máy để hiển thị cho rõ ràng)
const getTickets = async (req, res) => {
  const loggedInApproverId = req.user?.user_id;

  if (!loggedInApproverId) {
    return res
      .status(401)
      .json({ error: "Bạn cần đăng nhập để xem danh sách quản lý!" });
  }

  try {
    const query = `
      SELECT 
        t.ticket_id,
        t.reporter_name,
        t.issue_description,
        t.priority,
        t.status,
        t.created_at,
        t.assigned_to,
        t.solution,
        m.machine_code,
        m.machine_name,
        m.line_no
      FROM maintenance_ticket t
      -- 1. Từ Ticket nối sang bảng Machine
      JOIN machine m ON t.machine_id = m.machine_id
      
      -- 2. Từ Machine nối sang bảng Machine_Type
      JOIN machine_type mt ON m.machine_type_id = mt.machine_type_id
      
      -- 3. Từ Machine_Type nối sang bảng Checklist_Template
      JOIN checklist_template ct ON mt.machine_type_id = ct.machine_type_id
      
      -- 4. Lọc theo approver_id của người đang đăng nhập
      WHERE ct.approver_id = $1 
      
      ORDER BY 
        CASE t.status 
          WHEN 'PENDING' THEN 1
          WHEN 'PROCESSING' THEN 2
          WHEN 'CLOSED' THEN 3
          ELSE 4 
        END, 
        t.created_at DESC;
    `;

    const result = await pool.query(query, [loggedInApproverId]);
    res.status(200).json({ success: true, tickets: result.rows });
  } catch (err) {
    console.error(
      "Lỗi lấy danh sách ticket theo người phụ trách:",
      err.message,
    );
    res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách yêu cầu!" });
  }
};

// 2. API: Cập nhật trạng thái và thông tin xử lý sự cố (Duyệt ticket)
const updateTicketStatus = async (req, res) => {
  const { ticket_id } = req.params;
  const { status, assigned_to, solution } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Thiếu trạng thái cập nhật!" });
  }

  try {
    const query = `
        UPDATE maintenance_ticket
        SET 
          status = $1,
          assigned_to = COALESCE($2, assigned_to),
          solution = COALESCE($3, solution),
          updated_at = timezone('Asia/Ho_Chi_Minh', now())
        WHERE ticket_id = $4
        RETURNING *;
      `;
    const result = await pool.query(query, [
      status,
      assigned_to,
      solution,
      ticket_id,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy yêu cầu sửa chữa này!" });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái yêu cầu thành công!",
      ticket: result.rows[0],
    });
  } catch (err) {
    console.error("Lỗi cập nhật ticket:", err.message);
    res.status(500).json({ error: "Lỗi hệ thống khi cập nhật trạng thái!" });
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicketStatus,
};
