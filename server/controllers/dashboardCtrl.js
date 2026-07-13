const { pool } = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 1. Tổng số máy lưu trong hệ thống
    const totalMachinesRes = await pool.query(`SELECT COUNT(*) FROM machine`);
    const totalMachines = parseInt(totalMachinesRes.rows[0].count);

    // 2. Số máy ĐANG hoạt động (active = true)
    const activeMachinesRes = await pool.query(
      `SELECT COUNT(*) FROM machine WHERE active = true`
    );
    const activeMachines = parseInt(activeMachinesRes.rows[0].count);

    // 3. 🌟 Số máy KHÔNG hoạt động (active = false)
    const stoppedMachinesRes = await pool.query(
      `SELECT COUNT(*) FROM machine WHERE active = false`
    );
    const stoppedMachines = parseInt(stoppedMachinesRes.rows[0].count);

    // 4. Số máy đã thực hiện check hôm nay (Chỉ tính trên những máy đang active)
    const todayInspectionsRes = await pool.query(
      `
        SELECT DISTINCT machine_id 
        FROM inspection_header 
        WHERE DATE(inspection_date) = $1
      `,
      [today]
    );
    const checkedMachines = todayInspectionsRes.rows.length;

    // Máy chưa check = Tổng máy đang chạy - Máy đã check
    const pendingMachines = activeMachines - checkedMachines;

    // 5. Số máy phát sinh lỗi NG hôm nay (Giữ nguyên)
    const totalNgRes = await pool.query(
      `
        SELECT COUNT(DISTINCT h.machine_id) 
        FROM inspection_detail d
        JOIN inspection_header h ON d.inspection_id = h.inspection_id
        WHERE DATE(h.inspection_date) = $1 AND (d.result = 'NG' OR d.result = 'ng' OR d.result = 'X')
      `,
      [today]
    );
    const ngMachines = parseInt(totalNgRes.rows[0].count);

    // 6. Danh sách chi tiết các máy lỗi NG (Giữ nguyên)
    const alertListRes = await pool.query(
      `
        SELECT DISTINCT 
          m.machine_code, m.machine_name, c.item_name, d.result, d.value, c.standard_value
        FROM inspection_detail d
        JOIN inspection_header h ON d.inspection_id = h.inspection_id
        JOIN machine m ON h.machine_id = m.machine_id
        JOIN checklist_item c ON d.item_id = c.item_id
        WHERE DATE(h.inspection_date) = $1 AND (d.result = 'NG' OR d.result = 'ng' OR d.result = 'X')
      `,
      [today]
    );

    res.status(200).json({
      success: true,
      summary: {
        totalMachines,
        activeMachines, // 🌟 Gửi thêm số máy đang chạy
        stoppedMachines, // 🌟 Số máy đang dừng (active = false)
        checkedMachines,
        pendingMachines,
        ngMachines,
      },
      alerts: alertListRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Lỗi hệ thống Dashboard!" });
  }
};

module.exports = {
  getDashboardStats,
};
