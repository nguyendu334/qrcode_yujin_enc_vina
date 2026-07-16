// controllers/ticketController.js
const { pool } = require("../config/db");

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
      err.message
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
