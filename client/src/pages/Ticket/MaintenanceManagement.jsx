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
  Stack,
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
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignedTo, setAssignedTo] = useState("");
  const [solution, setSolution] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.get("/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTickets(res.data.tickets || []);
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

      fetchTickets();
    } catch (err) {
      toast.error(
        "Cập nhật thất bại: " + (err.response?.data?.error || err.message),
      );
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return {
          bg: "#fef2f2",
          text: "#ef4444",
          label: t("maintenance.pending"),
        };

      case "PROCESSING":
        return {
          bg: "#fef3c7",
          text: "#d97706",
          label: t("maintenance.processing"),
        };

      case "CLOSED":
        return {
          bg: "#ecfdf5",
          text: "#10b981",
          label: t("maintenance.close"),
        };

      default:
        return {
          bg: "#f1f5f9",
          text: "#64748b",
          label: "Không xác định",
        };
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === "HIGH") {
      return (
        <Typography
          component="span"
          sx={{ color: "#ef4444", fontWeight: "bold", fontSize: 13 }}
        >
          ⚠️ {t("maintenance.high")}
        </Typography>
      );
    }

    if (priority === "NORMAL") {
      return (
        <Typography component="span" sx={{ color: "#3b82f6", fontSize: 13 }}>
          {t("maintenance.nomal")}
        </Typography>
      );
    }

    return (
      <Typography component="span" sx={{ color: "#64748b", fontSize: 13 }}>
        {t("maintenance.low")}
      </Typography>
    );
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setAssignedTo(ticket.assigned_to || "");
    setSolution(ticket.solution || "");
  };

  // PANEL CHI TIẾT VÀ XỬ LÝ
  const renderTicketDetail = () => {
    if (!selectedTicket) return null;

    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          position: { xs: "static", md: "sticky" },
          top: 20,
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, sm: 2.5 },
            py: 1.5,
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", color: "#1e293b" }}
          >
            {t("maintenance.ticket_detail")}
          </Typography>

          <IconButton
            size="small"
            onClick={() => setSelectedTicket(null)}
            sx={{ color: "#94a3b8" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={1.5} sx={{ mb: 2.5 }}>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              <strong>{t("maintenance.device")}:</strong>{" "}
              {selectedTicket.machine_code} - {selectedTicket.machine_name}
            </Typography>

            <Typography variant="body2" sx={{ color: "#475569" }}>
              <strong>{t("maintenance.reporter")}:</strong>{" "}
              {selectedTicket.reporter_name}
            </Typography>

            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "#475569", mb: 0.5 }}
              >
                {t("maintenance.issue_description_label")}:
              </Typography>

              <Box
                sx={{
                  backgroundColor: "#f8fafc",
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                  color: "#475569",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {selectedTicket.issue_description}
              </Box>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#1e293b", mb: 2 }}
          >
            {t("maintenance.update_solution")}
          </Typography>

          <Stack spacing={2} sx={{ mb: 3 }}>
            <TextField
              label={t("maintenance.assigned_to")}
              placeholder={t("maintenance.assigned_to_placeholder")}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            />

            <TextField
              label={t("maintenance.solution_label")}
              placeholder={t("maintenance.solution_placeholder")}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            />
          </Stack>

          <Stack spacing={1.5}>
            {selectedTicket.status === "PENDING" && (
              <Button
                variant="contained"
                color="warning"
                fullWidth
                startIcon={<BuildIcon />}
                onClick={() =>
                  handleUpdateStatus(selectedTicket.ticket_id, "PROCESSING")
                }
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  py: 1.2,
                  borderRadius: 2,
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" },
                }}
              >
                {t("maintenance.btn_start_processing")}
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
                py: 1.2,
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
              }}
            >
              {t("maintenance.btn_close_ticket")}
            </Button>
          </Stack>
        </Box>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 3 },
        maxWidth: 1400,
        mx: "auto",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {/* TIÊU ĐỀ */}
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: "bold",
          color: "#1e293b",
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: "1.15rem", sm: "1.5rem" },
        }}
      >
        {t("maintenance.title")}
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            py: 5,
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Đang tải danh sách yêu cầu bảo trì...
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: selectedTicket
              ? {
                  xs: "minmax(0, 1fr)",
                  md: "minmax(0, 2.2fr) minmax(300px, 1fr)",
                }
              : "minmax(0, 1fr)",
            gap: { xs: 2, md: 3 },
            alignItems: "start",
            minWidth: 0,
          }}
        >
          {/* DANH SÁCH TICKET */}
          <Box sx={{ minWidth: 0, width: "100%" }}>
            {/* MOBILE: HIỂN THỊ CARD */}
            <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
              {tickets.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    border: "1px solid #e2e8f0",
                    borderRadius: 2,
                    color: "#64748b",
                  }}
                >
                  Không có yêu cầu bảo trì.
                </Paper>
              ) : (
                tickets.map((m) => {
                  const style = getStatusStyle(m.status);
                  const isSelected = selectedTicket?.ticket_id === m.ticket_id;

                  return (
                    <Card
                      key={m.ticket_id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: isSelected
                          ? "1px solid #16a34a"
                          : "1px solid #e2e8f0",
                        backgroundColor: isSelected ? "#f0fdf4" : "#fff",
                        minWidth: 0,
                      }}
                    >
                      <Stack spacing={1.2}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: "bold",
                              color: "#1e293b",
                              fontSize: 14,
                              minWidth: 0,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {m.machine_name}
                          </Typography>

                          <Chip
                            label={style.label}
                            size="small"
                            sx={{
                              flexShrink: 0,
                              backgroundColor: style.bg,
                              color: style.text,
                              fontWeight: "bold",
                              fontSize: 11,
                              borderRadius: 1.5,
                            }}
                          />
                        </Box>

                        <Divider />

                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              "minmax(0, 1fr) minmax(0, 1fr)",
                            gap: 1.2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t("maintenance.reporter")}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#334155",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {m.reporter_name}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t("maintenance.priority")}
                            </Typography>
                            <Box>{getPriorityBadge(m.priority)}</Box>
                          </Box>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t("maintenance.description")}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#475569",
                              overflowWrap: "anywhere",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {m.issue_description}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t("maintenance.time")}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#475569" }}>
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
                          </Typography>
                        </Box>

                        <Button
                          variant={isSelected ? "contained" : "outlined"}
                          size="medium"
                          color={m.status === "CLOSED" ? "inherit" : "primary"}
                          startIcon={<ViewIcon />}
                          disabled={m.status === "CLOSED"}
                          fullWidth
                          onClick={() => handleSelectTicket(m)}
                          sx={{
                            textTransform: "none",
                            borderRadius: 1.5,
                            fontWeight: "bold",
                            mt: 0.5,
                            "&.Mui-disabled": {
                              backgroundColor: "#f1f5f9",
                              color: "#94a3b8",
                              borderColor: "#cbd5e1",
                            },
                          }}
                        >
                          {m.status === "CLOSED"
                            ? t("maintenance.close")
                            : t("maintenance.handle")}
                        </Button>
                      </Stack>
                    </Card>
                  );
                })
              )}
            </Stack>

            {/* DESKTOP: HIỂN THỊ TABLE */}
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                display: { xs: "none", md: "block" },
                width: "100%",
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                overflowX: "auto",
              }}
            >
              <Table sx={{ minWidth: 850 }}>
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow sx={{ borderBottom: "2px solid #e2e8f0" }}>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                    >
                      {t("maintenance.machinename")}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                    >
                      {t("maintenance.reporter")}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                    >
                      {t("maintenance.description")}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                    >
                      {t("maintenance.priority")}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                    >
                      {t("maintenance.time")}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                    >
                      {t("maintenance.status")}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: "bold", color: "#64748b", py: 2 }}
                    >
                      {t("maintenance.action")}
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tickets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 4, color: "#64748b" }}
                      >
                        Không có yêu cầu bảo trì.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tickets.map((m) => {
                      const style = getStatusStyle(m.status);
                      const isSelected =
                        selectedTicket?.ticket_id === m.ticket_id;

                      return (
                        <TableRow
                          key={m.ticket_id}
                          hover
                          sx={{
                            backgroundColor: isSelected ? "#f0fdf4" : "inherit",
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell sx={{ color: "#334155" }}>
                            {m.machine_name}
                          </TableCell>

                          <TableCell sx={{ color: "#334155" }}>
                            {m.reporter_name}
                          </TableCell>

                          <TableCell
                            sx={{
                              maxWidth: 250,
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

                          <TableCell sx={{ whiteSpace: "nowrap" }}>
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
                                fontSize: 12,
                                borderRadius: 1,
                              }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Button
                              variant={isSelected ? "contained" : "outlined"}
                              size="small"
                              color={
                                m.status === "CLOSED" ? "inherit" : "primary"
                              }
                              startIcon={<ViewIcon />}
                              disabled={m.status === "CLOSED"}
                              onClick={() => handleSelectTicket(m)}
                              sx={{
                                textTransform: "none",
                                borderRadius: 1,
                                fontWeight: "bold",
                                whiteSpace: "nowrap",
                                "&.Mui-disabled": {
                                  backgroundColor: "#f1f5f9",
                                  color: "#94a3b8",
                                  borderColor: "#cbd5e1",
                                },
                              }}
                            >
                              {m.status === "CLOSED"
                                ? t("maintenance.close")
                                : t("maintenance.handle")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* PANEL CHI TIẾT */}
          {selectedTicket && (
            <Box sx={{ minWidth: 0, width: "100%" }}>
              {renderTicketDetail()}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MaintenanceManagement;
