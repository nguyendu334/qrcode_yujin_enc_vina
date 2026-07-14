import { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { getDashboard } from "../../services/dashboardService";

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalMachines: 0,
    checkedMachines: 0,
    pendingMachines: 0,
    ngMachines: 0,
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy dữ liệu dashboard khi load trang
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getDashboard();
        if (res.success) {
          setStats(res.summary);
          setAlerts(res.alerts);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Cơ chế tự động làm mới dữ liệu sau mỗi 5 phút (Real-time xưởng sản xuất)
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Đang tải dữ liệu Dashboard sản xuất...
      </div>
    );

  return (
    <div
      style={{
        padding: "25px",
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* TIÊU ĐỀ TRANG */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#1e293b" }}>
            {t(`dashboard.title`)}
          </h2>
          <p
            style={{ margin: "5px 0 0 0", color: "#64748b", fontSize: "14px" }}
          >
            {t(`dashboard.content`)}
          </p>
        </div>
        <div
          style={{
            backgroundColor: "#fff",
            padding: "8px 15px",
            borderRadius: "6px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            fontSize: "14px",
            fontWeight: "bold",
            color: "#475569",
          }}
        >
          📅 {t(`dashboard.today`)}: {new Date().toLocaleDateString("vi-VN")}
        </div>
      </div>

      {/* KHU VỰC 4 THẺ KPI ĐÁNH GIÁ NHANH */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* Thẻ 1: Tổng số máy lưu trong DB */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            borderLeft: "5px solid #64748b",
          }}
        >
          <div
            style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}
          >
            {t(`dashboard.allmachine`)}
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: "bold",
              color: "#1e293b",
              marginTop: "10px",
            }}
          >
            {stats.totalMachines}{" "}
            <span style={{ fontSize: "13px", fontWeight: "normal" }}>
              {" "}
              {t(`dashboard.machine`)}
            </span>
          </div>
        </div>

        {/* Thẻ 2: Số máy active = true */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            borderLeft: "5px solid #3b82f6",
          }}
        >
          <div
            style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}
          >
            {t(`dashboard.online`)}
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: "bold",
              color: "#3b82f6",
              marginTop: "10px",
            }}
          >
            {stats.activeMachines}{" "}
            <span style={{ fontSize: "13px", fontWeight: "normal" }}>
              {t(`dashboard.machine`)}
            </span>
          </div>
        </div>

        {/* Thẻ 3: Số máy active = false */}
        <div
          style={{
            backgroundColor: stats.stoppedMachines > 0 ? "#f8fafc" : "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            borderLeft: "5px solid #94a3b8",
          }}
        >
          <div
            style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}
          >
            {t(`dashboard.offline`)}
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: "bold",
              color: "#64748b",
              marginTop: "10px",
            }}
          >
            {stats.stoppedMachines}{" "}
            <span
              style={{
                fontSize: "13px",
                fontWeight: "normal",
                color: "#94a3b8",
              }}
            >
              {t(`dashboard.machine`)}
            </span>
          </div>
        </div>

        {/* Thẻ 4: Đã check hôm nay */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            borderLeft: "5px solid #10b981",
          }}
        >
          <div
            style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}
          >
            {t(`dashboard.checkedtoday`)}
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: "bold",
              color: "#10b981",
              marginTop: "10px",
            }}
          >
            {stats.checkedMachines}
          </div>
        </div>

        {/* Thẻ 5: Phát sinh lỗi NG */}
        <div
          style={{
            backgroundColor: stats.ngMachines > 0 ? "#fef2f2" : "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            borderLeft: "5px solid #ef4444",
          }}
        >
          <div
            style={{ fontSize: "13px", color: "#ef4444", fontWeight: "600" }}
          >
            {t(`dashboard.ngdevice`)}
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: "bold",
              color: "#ef4444",
              marginTop: "10px",
            }}
          >
            {stats.ngMachines}
          </div>
        </div>
      </div>

      {/* BẢNG CẢNH BÁO CÁC MÁY BỊ LỖI TRONG NGÀY (ANOMALIES ALERTS) */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: alerts.length > 0 ? "#ef4444" : "#10b981",
              animate: "pulse 2s infinite",
            }}
          ></div>
          <h3 style={{ margin: 0, color: "#1e293b" }}>
            ⚠️ {t(`dashboard.listng`)}
          </h3>
        </div>

        {alerts.length === 0 ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#10b981",
              fontWeight: "600",
              backgroundColor: "#f0fdf4",
              borderRadius: "6px",
            }}
          >
            🎉 {t(`dashboard.excellent`)}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f1f5f9",
                    borderBottom: "2px solid #cbd5e1",
                  }}
                >
                  <th style={{ padding: "12px", color: "#475569" }}>Mã Máy</th>
                  <th style={{ padding: "12px", color: "#475569" }}>
                    Tên Thiết Bị
                  </th>
                  <th style={{ padding: "12px", color: "#475569" }}>
                    Hạng Mục Bị Lỗi
                  </th>
                  <th style={{ padding: "12px", color: "#475569" }}>
                    Tiêu Chuẩn Gốc
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textCol: "#ef4444",
                      color: "#ef4444",
                    }}
                  >
                    Giá Trị/Kết Quả Nhập
                  </th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      backgroundColor: "#fff5f5",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "bold",
                        color: "#334155",
                      }}
                    >
                      {alert.machine_code}
                    </td>
                    <td style={{ padding: "12px", color: "#475569" }}>
                      {alert.machine_name}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#b91c1c",
                        fontWeight: "500",
                      }}
                    >
                      ❌ {alert.item_name}
                    </td>
                    <td style={{ padding: "12px", color: "#64748b" }}>
                      {alert.standard_value}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#b91c1c",
                        fontWeight: "bold",
                      }}
                    >
                      {alert.value
                        ? `${alert.value} (Vượt ngưỡng)`
                        : alert.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
