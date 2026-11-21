const { pool } = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    // 🌟 Lấy department_id và ép kiểu số nguyên
    const rawDeptId = req.user?.department_id;
    const userDepartmentId = rawDeptId ? parseInt(rawDeptId, 10) : null;
    const role = (req.user?.role || "").toLowerCase();

    const now = new Date();
    const currentHour = now.getHours();

    let workingDate = new Date(now);
    let currentShift = "Ca ngày";

    if (currentHour >= 8 && currentHour < 20) {
      currentShift = "Ca ngày";
    } else {
      currentShift = "Ca đêm";
      if (currentHour < 8) {
        workingDate.setDate(workingDate.getDate() - 1);
      }
    }

    const todayStr = workingDate.toLocaleDateString("sv-SE"); // YYYY-MM-DD

    // 2. PHÂN QUYỀN
    let deptFilter = "";
    const params = [todayStr, currentShift];

    if (role !== "manager") {
      if (userDepartmentId) {
        deptFilter = " AND m.department_id = $3";
        params.push(userDepartmentId);
      } else {
        // Trường hợp không lấy được department_id từ Token/Query
        return res.json({
          success: true,
          summary: {
            totalMachines: 0,
            activeMachines: 0,
            stoppedMachines: 0,
            checkedMachines: 0,
            uncheckedMachines: 0,
            currentShift,
            workingDate: todayStr,
          },
          checkedList: [],
          uncheckedList: [],
        });
      }
    }

    // Query 1: Máy ĐÃ CHECK
    const checkedQuery = `
      SELECT DISTINCT ON (m.machine_id)
        h.inspection_id,
        m.machine_id, 
        m.machine_code, 
        m.machine_name, 
        d.department_name,
        COALESCE(a.area_name, m.line_no, '—') AS location,
        m.line_no,
        h.inspection_date, 
        h.inspector,
        COALESCE(u_approver.full_name, '—') AS person_in_charge,
        h.approval_status,
        -- 💡 Kiểm tra xem phiếu này có bất kỳ hạng mục nào bị NG không
        EXISTS (
          SELECT 1 
          FROM inspection_detail d_check 
          WHERE d_check.inspection_id = h.inspection_id 
            AND d_check.result = 'NG'
        ) AS has_ng
      FROM machine m
      JOIN inspection_header h ON m.machine_id = h.machine_id
      LEFT JOIN department d ON m.department_id = d.department_id
      LEFT JOIN area a ON m.area_id = a.area_id
      LEFT JOIN checklist_template ct ON m.machine_type_id = ct.machine_type_id AND ct.active = true
      LEFT JOIN users u_approver ON ct.approver_id = u_approver.user_id
      WHERE h.inspection_date::date = $1::date
        AND TRIM(h.shift) = TRIM($2)
        ${deptFilter}
      ORDER BY m.machine_id, h.inspection_date DESC;
    `;

    // Query 2: Máy CHƯA CHECK
    const uncheckedQuery = `
      SELECT 
        m.machine_id, 
        m.machine_code, 
        m.machine_name, 
        d.department_name,                                   -- Tên bộ phận
        COALESCE(a.area_name, m.line_no, '—') AS location,   -- Vị trí
        m.line_no,
        '—' AS inspector,                                    -- Chưa kiểm tra
        COALESCE(u_approver.full_name, '—') AS person_in_charge -- Người phụ trách (lấy từ template)
      FROM machine m
      LEFT JOIN department d ON m.department_id = d.department_id
      LEFT JOIN area a ON m.area_id = a.area_id
      -- JOIN lấy người phụ trách từ checklist_template theo machine_type_id
      LEFT JOIN checklist_template ct ON m.machine_type_id = ct.machine_type_id AND ct.active = true
      LEFT JOIN users u_approver ON ct.approver_id = u_approver.user_id
      WHERE m.active = true
        AND m.machine_id NOT IN (
          SELECT h.machine_id 
          FROM inspection_header h 
          WHERE h.inspection_date::date = $1::date
            AND TRIM(h.shift) = TRIM($2)
        )
        ${deptFilter}
      ORDER BY m.machine_code ASC;
    `;

    // Query 3: Thống kê tổng số máy
    let summaryQuery = "";
    let summaryParams = [];

    if (role === "manager") {
      summaryQuery = `
        SELECT 
          COUNT(m.machine_id) AS "totalMachines",
          COUNT(CASE WHEN m.active = true THEN 1 END) AS "activeMachines",
          COUNT(CASE WHEN m.active = false THEN 1 END) AS "stoppedMachines"
        FROM machine m;
      `;
    } else {
      summaryQuery = `
        SELECT 
          COUNT(m.machine_id) AS "totalMachines",
          COUNT(CASE WHEN m.active = true THEN 1 END) AS "activeMachines",
          COUNT(CASE WHEN m.active = false THEN 1 END) AS "stoppedMachines"
        FROM machine m
        WHERE m.department_id = $1;
      `;
      summaryParams = [userDepartmentId];
    }

    const [checkedRes, uncheckedRes, summaryRes] = await Promise.all([
      pool.query(checkedQuery, params),
      pool.query(uncheckedQuery, params),
      pool.query(summaryQuery, summaryParams),
    ]);

    res.json({
      success: true,
      summary: {
        totalMachines: parseInt(summaryRes.rows[0]?.totalMachines || 0, 10),
        activeMachines: parseInt(summaryRes.rows[0]?.activeMachines || 0, 10),
        stoppedMachines: parseInt(summaryRes.rows[0]?.stoppedMachines || 0, 10),
        checkedMachines: checkedRes.rows.length,
        uncheckedMachines: uncheckedRes.rows.length,
        currentShift,
        workingDate: todayStr,
      },
      checkedList: checkedRes.rows,
      uncheckedList: uncheckedRes.rows,
    });
  } catch (error) {
    console.error("Lỗi getDashboardData:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
