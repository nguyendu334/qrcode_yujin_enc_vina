const { pool } = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const userDepartmentId = req.user?.department_id || req.query.departmentId;
    const role = (req.user?.role || "").toLowerCase();

    // 1. Lấy ngày hôm nay theo giờ địa phương (YYYY-MM-DD)
    const today = new Date().toLocaleDateString("sv-SE"); // Chuỗi dạng "2026-08-26"

    // 2. Xác định Ca làm việc khớp với DB ("Ca ngày" hoặc "Ca đêm")
    const currentHour = new Date().getHours();
    // Ví dụ: Từ 06:00 đến 18:00 là "Ca ngày", còn lại là "Ca đêm"
    const currentShift =
      currentHour >= 6 && currentHour < 18 ? "Ca ngày" : "Ca đêm";

    // 3. Xử lý bộ lọc theo Bộ phận
    let deptFilter = "";
    const params = [today, currentShift];

    if (role !== "manager" && role !== "admin" && userDepartmentId) {
      deptFilter = " AND m.department_id = $3";
      params.push(userDepartmentId);
    }

    // Query 1: Danh sách máy ĐÃ CHECK trong ca hôm nay
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

    // Query 2: Danh sách máy CHƯA CHECK trong ca hôm nay
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

    // Query 3: Tổng số máy
    const summaryQuery = `
      SELECT 
        COUNT(m.machine_id) AS "totalMachines",
        COUNT(CASE WHEN m.active = true THEN 1 END) AS "activeMachines",
        COUNT(CASE WHEN m.active = false THEN 1 END) AS "stoppedMachines"
      FROM machine m
      WHERE 1=1 ${deptFilter};
    `;

    const summaryParams =
      role !== "manager" && role !== "admin" && userDepartmentId
        ? [userDepartmentId]
        : [];

    const [checkedRes, uncheckedRes, summaryRes] = await Promise.all([
      pool.query(checkedQuery, params),
      pool.query(uncheckedQuery, params),
      pool.query(summaryQuery, summaryParams),
    ]);

    res.json({
      success: true,
      summary: {
        totalMachines: parseInt(summaryRes.rows[0]?.totalMachines || 0),
        activeMachines: parseInt(summaryRes.rows[0]?.activeMachines || 0),
        stoppedMachines: parseInt(summaryRes.rows[0]?.stoppedMachines || 0),
        checkedMachines: checkedRes.rows.length,
        uncheckedMachines: uncheckedRes.rows.length,
        currentShift,
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
