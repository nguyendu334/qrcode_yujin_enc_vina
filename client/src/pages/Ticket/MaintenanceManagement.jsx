import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import api from "../../helper/api";

const MaintenanceManagement = () => {
  const { t } = useTranslation();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null); // Lưu ticket đang được chọn để xử lý
  const [assignedTo, setAssignedTo] = useState("");
  const [solution, setSolution] = useState("");

  // Tải danh sách ticket
  const fetchTickets = async () => {
    try {
      setLoading(true);

      // Lấy token từ localStorage hoặc State quản lý tài khoản của bạn
      const token = localStorage.getItem("token");

      const res = await api.get("/tickets", {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi kèm token để Backend nhận diện ai đang đăng nhập
        },
      });

      setTickets(res.data.tickets);
    } catch (err) {
      toast.error("Không thể tải danh sách yêu cầu của bạn!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await api.put(`/tickets/${ticketId}`, {
        status: newStatus,
        assigned_to: assignedTo || null,
        solution: solution || null,
      });
      toast.success("Cập nhật tiến độ thành công!");
      setSelectedTicket(null);
      setAssignedTo("");
      setSolution("");
      fetchTickets(); // Tải lại danh sách mới nhất
    } catch (err) {
      toast.error(
        "Cập nhật thất bại: " + (err.response?.data?.error || err.message)
      );
    }
  };

  // Định nghĩa màu sắc trực quan cho từng trạng thái
  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return {
          bg: "#fef2f2",
          text: "#ef4444",
          label: t(`maintenance.pending`),
        };
      case "PROCESSING":
        return {
          bg: "#fef3c7",
          text: "#d97706",
          label: t(`maintenance.processing`),
        };
      case "CLOSED":
        return {
          bg: "#ecfdf5",
          text: "#10b981",
          label: t(`maintenance.close`),
        };
      default:
        return { bg: "#f1f5f9", text: "#64748b", label: "Không xác định" };
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === "HIGH")
      return (
        <span style={{ color: "#ef4444", fontWeight: "bold" }}>
          ⚠️ {t(`maintenance.high`)}
        </span>
      );
    if (priority === "NORMAL")
      return <span style={{ color: "#3b82f6" }}>{t(`maintenance.nomal`)}</span>;
    return <span style={{ color: "#64748b" }}>{t(`maintenance.low`)}</span>;
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Segoe UI, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ color: "#1e293b", marginBottom: "20px" }}>
        {t(`maintenance.title`)}
      </h2>

      {loading ? (
        <div>Đang tải danh sách yêu cầu bảo trì...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: selectedTicket ? "2fr 1fr" : "1fr",
            gap: "20px",
          }}
        >
          {/* BẢNG DANH SÁCH TICKET */}
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #e2e8f0",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  <th style={{ padding: "12px" }}>{t(`maintenance.machinecode`)}</th>
                  <th style={{ padding: "12px" }}>{t(`maintenance.machinename`)}</th>
                  <th style={{ padding: "12px" }}>{t(`maintenance.reporter`)}</th>
                  <th style={{ padding: "12px" }}>{t(`maintenance.description`)}</th>
                  <th style={{ padding: "12px" }}>{t(`maintenance.priority`)}</th>
                  <th style={{ padding: "12px" }}>{t(`maintenance.status`)}</th>
                  <th style={{ padding: "12px" }}>{t(`maintenance.action`)}</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((m) => {
                  const style = getStatusStyle(m.status);
                  return (
                    <tr
                      key={m.ticket_id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "14px",
                      }}
                    >
                      <td style={{ padding: "12px", fontWeight: "bold" }}>
                        {m.machine_code}
                      </td>
                      <td style={{ padding: "12px" }}>{m.machine_name}</td>
                      <td style={{ padding: "12px" }}>{m.reporter_name}</td>
                      <td
                        style={{
                          padding: "12px",
                          maxWidth: "250px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={m.issue_description}
                      >
                        {m.issue_description}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {getPriorityBadge(m.priority)}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            backgroundColor: style.bg,
                            color: style.text,
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button
                          onClick={() => {
                            setSelectedTicket(m);
                            setAssignedTo(m.assigned_to || "");
                            setSolution(m.solution || "");
                          }}
                          style={{
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          {t(`maintenance.handle`)}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PANEL CHI TIẾT & DUYỆT TICKET (HIỆN LÊN BÊN PHẢI KHI CLICK CHỌN) */}
          {selectedTicket && (
            <div
              style={{
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h3 style={{ margin: 0, color: "#1e293b" }}>
                  {t(`maintenance.ticket_detail`)}
                </h3>
                <button
                  onClick={() => setSelectedTicket(null)}
                  style={{
                    border: "none",
                    background: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#475569",
                  lineHeight: "1.6",
                  marginBottom: "20px",
                }}
              >
                <p>
                  <strong>{t(`maintenance.device`)}:</strong> {selectedTicket.machine_code} -{" "}
                  {selectedTicket.machine_name}
                </p>
                <p>
                  <strong>{t(`maintenance.reporter`)}:</strong>{" "}
                  {selectedTicket.reporter_name}
                </p>
                <p>
                  <strong>{t(`maintenance.issue_description_label`)}:</strong>
                </p>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontStyle: "italic",
                    marginBottom: "15px",
                  }}
                >
                  {selectedTicket.issue_description}
                </div>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid #e2e8f0",
                  margin: "15px 0",
                }}
              />

              {/* KHU VỰC CẬP NHẬT TIẾN ĐỘ CỦA CƠ ĐIỆN */}
              <h4 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>
              {t(`maintenance.update_solution`)}
              </h4>

              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: "4px",
                  }}
                >
                  {t(`maintenance.assigned_to`)}
                </label>
                <input
                  type="text"
                  placeholder={t(`maintenance.assigned_to_placeholder`)}
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: "4px",
                  }}
                >
                  {t(`maintenance.solution_label`)}
                </label>
                <textarea
                  rows="3"
                  placeholder={t(`maintenance.solution_placeholder`)}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    fontSize: "13px",
                    resize: "none",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {selectedTicket.status === "PENDING" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedTicket.ticket_id, "PROCESSING")
                    }
                    style={{
                      backgroundColor: "#f59e0b",
                      color: "#fff",
                      border: "none",
                      padding: "10px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    ⚙️ {t(`maintenance.btn_start_processing`)}
                  </button>
                )}

                <button
                  onClick={() =>
                    handleUpdateStatus(selectedTicket.ticket_id, "CLOSED")
                  }
                  style={{
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    padding: "10px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  ✅ {t(`maintenance.btn_close_ticket`)}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaintenanceManagement;
