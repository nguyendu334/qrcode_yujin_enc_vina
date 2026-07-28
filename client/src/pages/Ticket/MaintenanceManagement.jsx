import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

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
        "Cập nhật thất bại: " + (err.response?.data?.error || err.message),
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
    <Box sx={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* TIÊU ĐỀ TRANG */}
      <Typography
        variant="h5"
        component="h2"
        sx={{ fontWeight: "bold", color: "#1e293b", marginBottom: 3 }}
      >
        {t(`maintenance.title`)}
      </Typography>

      {loading ? (
        /* LOADING STATE */
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}>
          <CircularProgress size={24} />
          <Typography variant="body1" sx={{ color: "#64748b" }}>
            Đang tải danh sách yêu cầu bảo trì...
          </Typography>
        </Box>
      ) : (
        /* KHU VỰC CHÍNH */
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: selectedTicket
              ? { xs: "1fr", md: "2.2fr 1fr" }
              : "1fr",
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* BẢNG DANH SÁCH TICKET */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
              overflow: "hidden",
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                <TableRow sx={{ borderBottom: "2px solid #e2e8f0" }}>
                  {/* <TableCell
                    sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                  >
                    {t(`maintenance.machinecode`)}
                  </TableCell> */}
                  <TableCell
                    sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                  >
                    {t(`maintenance.machinename`)}
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                  >
                    {t(`maintenance.reporter`)}
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                  >
                    {t(`maintenance.description`)}
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                  >
                    {t(`maintenance.priority`)}
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                  >
                    {t(`maintenance.time`)}
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                  >
                    {t(`maintenance.status`)}
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                    align="right"
                  >
                    {t(`maintenance.action`)}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((m) => {
                  const style = getStatusStyle(m.status);
                  const isSelected = selectedTicket?.ticket_id === m.ticket_id;

                  return (
                    <TableRow
                      key={m.ticket_id}
                      hover
                      sx={{
                        backgroundColor: isSelected ? "#f0fdf4" : "inherit",
                        transition: "background-color 0.2s",
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      {/* <TableCell sx={{ fontWeight: "bold", color: "#1e293b" }}>
                        {m.machine_code}
                      </TableCell> */}
                      <TableCell sx={{ color: "#334155" }}>
                        {m.machine_name}
                      </TableCell>
                      <TableCell sx={{ color: "#334155" }}>
                        {m.reporter_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: "250px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "#475569",
                        }}
                        title={m.issue_description}
                      >
                        {m.issue_description}
                      </TableCell>
                      <TableCell>{getPriorityBadge(m.priority)}</TableCell>
                      <TableCell>
                        {m.created_at
                          ? new Date(m.created_at).toLocaleString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={style.label}
                          size="small"
                          sx={{
                            backgroundColor: style.bg,
                            color: style.text,
                            fontWeight: "bold",
                            fontSize: "12px",
                            borderRadius: "8px",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant={isSelected ? "contained" : "outlined"}
                          size="small"
                          color={m.status === "CLOSED" ? "inherit" : "primary"}
                          startIcon={<ViewIcon />}
                          disabled={m.status === "CLOSED"} // Khóa nút khi trạng thái là CLOSED
                          onClick={() => {
                            setSelectedTicket(m);
                            setAssignedTo(m.assigned_to || "");
                            setSolution(m.solution || "");
                          }}
                          sx={{
                            textTransform: "none",
                            borderRadius: "6px",
                            fontWeight: "bold",
                            // Custom style mờ xám đẹp mắt khi bị khóa
                            "&.Mui-disabled": {
                              backgroundColor: "#f1f5f9",
                              color: "#94a3b8",
                              borderColor: "#cbd5e1",
                            },
                          }}
                        >
                          {m.status === "CLOSED"
                            ? t(`maintenance.close`)
                            : t(`maintenance.handle`)}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PANEL CHI TIẾT & DUYỆT TICKET (BÊN PHẢI) */}
          {selectedTicket && (
            <Card
              elevation={0}
              sx={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                position: "sticky",
                top: "20px",
              }}
            >
              {/* Header Panel */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  backgroundColor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "#1e293b" }}
                >
                  {t(`maintenance.ticket_detail`)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setSelectedTicket(null)}
                  sx={{ color: "#94a3b8", "&:hover": { color: "#64748b" } }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Body Panel */}
              <Box sx={{ padding: "20px" }}>
                {/* Thông tin sự cố */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    <strong>{t(`maintenance.device`)}:</strong>{" "}
                    {selectedTicket.machine_code} -{" "}
                    {selectedTicket.machine_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    <strong>{t(`maintenance.reporter`)}:</strong>{" "}
                    {selectedTicket.reporter_name}
                  </Typography>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", color: "#475569", mb: 0.5 }}
                    >
                      {t(`maintenance.issue_description_label`)}:
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: "#f8fafc",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "13px",
                        color: "#475569",
                        fontStyle: "italic",
                        lineHeight: 1.5,
                      }}
                    >
                      {selectedTicket.issue_description}
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Khu vực nhập tiến độ xử lý */}
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", color: "#1e293b", mb: 2 }}
                >
                  {t(`maintenance.update_solution`)}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <TextField
                    label={t(`maintenance.assigned_to`)}
                    placeholder={t(`maintenance.assigned_to_placeholder`)}
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />

                  <TextField
                    label={t(`maintenance.solution_label`)}
                    placeholder={t(`maintenance.solution_placeholder`)}
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Box>

                {/* Các nút hành động */}
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {selectedTicket.status === "PENDING" && (
                    <Button
                      variant="contained"
                      color="warning"
                      fullWidth
                      startIcon={<BuildIcon />}
                      onClick={() =>
                        handleUpdateStatus(
                          selectedTicket.ticket_id,
                          "PROCESSING",
                        )
                      }
                      sx={{
                        fontWeight: "bold",
                        textTransform: "none",
                        padding: "10px",
                        borderRadius: "8px",
                        boxShadow: "none",
                        "&:hover": { boxShadow: "none" },
                      }}
                    >
                      {t(`maintenance.btn_start_processing`)}
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    startIcon={<CheckCircleIcon />}
                    onClick={() =>
                      handleUpdateStatus(selectedTicket.ticket_id, "CLOSED")
                    }
                    sx={{
                      fontWeight: "bold",
                      textTransform: "none",
                      padding: "10px",
                      borderRadius: "8px",
                      boxShadow: "none",
                      "&:hover": { boxShadow: "none" },
                    }}
                  >
                    {t(`maintenance.btn_close_ticket`)}
                  </Button>
                </Box>
              </Box>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MaintenanceManagement;
