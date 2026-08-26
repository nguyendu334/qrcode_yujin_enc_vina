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
      SELECT DISTINCT 
        m.machine_id, 
        m.machine_code, 
        m.machine_name, 
        h.inspection_date, 
        h.inspector, 
        h.approval_status
      FROM machine m
      JOIN inspection_header h ON m.machine_id = h.machine_id
      WHERE h.inspection_date::date = $1::date
        AND TRIM(h.shift) = TRIM($2)
        ${deptFilter}
      ORDER BY h.inspection_date DESC;
    `;

    // Query 2: Máy CHƯA CHECK
    const uncheckedQuery = `
      SELECT m.machine_id, m.machine_code, m.machine_name
      FROM machine m
      WHERE m.active = true
        ${deptFilter}
        AND m.machine_id NOT IN (
          SELECT h.machine_id 
          FROM inspection_header h 
          WHERE h.inspection_date::date = $1::date 
            AND TRIM(h.shift) = TRIM($2)
        )
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
