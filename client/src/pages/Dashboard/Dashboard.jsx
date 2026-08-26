/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import { useTranslation } from "react-i18next";

import { getDashboard } from "../../services/dashboardService";

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalMachines: 0,
    activeMachines: 0,
    stoppedMachines: 0,
    checkedMachines: 0,
    uncheckedMachines: 0,
    currentShift: "CA 1",
  });
  const [checkedList, setCheckedList] = useState([]);
  const [uncheckedList, setUncheckedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: Đã check, 1: Chưa check

  const fetchDashboardData = async () => {
    try {
      const res = await getDashboard();
      if (res.success) {
        setStats(res.summary);
        setCheckedList(res.checkedList || []);
        setUncheckedList(res.uncheckedList || []);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // 5 phút reload 1 lần
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: "700", color: "#1e293b", mb: 0.5 }}
          >
            {t(`dashboard.title`)}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            {t(`dashboard.content`)} ({stats.currentShift})
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1,
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontWeight: "600",
            color: "#475569",
          }}
        >
          📅 {t(`dashboard.today`)}: {new Date().toLocaleDateString("vi-VN")}
        </Paper>
      </Box>

      {/* KPI CARDS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
          mb: 4,
        }}
      >
        <CardKPI
          t={t}
          title={t(`dashboard.online`)}
          value={stats.activeMachines}
          color="#3b82f6"
        />
        <CardKPI
          t={t}
          title={t(`dashboard.offline`)}
          value={stats.stoppedMachines}
          color="#94a3b8"
        />
        <CardKPI
          t={t}
          title={t(`dashboard.checkedtoday`)}
          value={stats.checkedMachines}
          color="#10b981"
        />
        <CardKPI
          t={t}
          title={t(`dashboard.await`)}
          value={stats.uncheckedMachines}
          color="#ef4444"
          isWarning={stats.uncheckedMachines > 0}
        />
      </Box>

      {/* BẢNG DANH SÁCH MÁY ĐÃ CHECK & CHƯA CHECK */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            pt: 1,
            backgroundColor: "#ffffff",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
          >
            <Tab
              label={`${t(`dashboard.checkedtoday`)} (${checkedList.length})`}
              sx={{ fontWeight: "600", textTransform: "none" }}
            />
            <Tab
              label={`${t(`dashboard.await`)} (${uncheckedList.length})`}
              sx={{
                fontWeight: "600",
                textTransform: "none",
                color: uncheckedList.length > 0 ? "#ef4444" : "inherit",
              }}
            />
          </Tabs>
        </Box>

        {/* TAB 1: DANH SÁCH MÁY ĐÃ CHECK */}
        {activeTab === 0 && (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "600" }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>Mã Thiết Bị</TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>Tên Thiết Bị</TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    Người Tích Kiểm Tra
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    Trạng Thái Duyệt
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checkedList.map((item, index) => (
                  <TableRow key={item.machine_id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: "600" }}>
                      {item.machine_code}
                    </TableCell>
                    <TableCell>{item.machine_name}</TableCell>
                    <TableCell>{item.inspector || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          <CheckCircleOutlineOutlinedIcon fontSize="small" />
                        }
                        label={item.approval_status || "Đã kiểm tra"}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {checkedList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 3, color: "#94a3b8" }}
                    >
                      Chưa có máy nào được kiểm tra trong ca này.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 2: DANH SÁCH MÁY CHƯA CHECK */}
        {activeTab === 1 && (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "600" }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>Mã Thiết Bị</TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>Tên Thiết Bị</TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>Trạng Thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uncheckedList.map((item, index) => (
                  <TableRow
                    key={item.machine_id}
                    hover
                    sx={{ backgroundColor: "#fef2f2" }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#b91c1c" }}>
                      {item.machine_code}
                    </TableCell>
                    <TableCell sx={{ color: "#7f1d1d" }}>
                      {item.machine_name}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<ErrorOutlineOutlinedIcon fontSize="small" />}
                        label="Chờ kiểm tra"
                        color="error"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {uncheckedList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ py: 3, color: "#10b981", fontWeight: "600" }}
                    >
                      🎉 Tuyệt vời! Tất cả thiết bị trong ca đã hoàn thành kiểm
                      tra.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

// COMPONENT CARD KPI CON
function CardKPI({ title, value, color, isWarning, t }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        borderLeft: `5px solid ${color}`,
        backgroundColor: isWarning ? "#fef2f2" : "#ffffff",
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}
      >
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: "700", color: color, mt: 1 }}>
        {value}{" "}
        <span
          style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "normal" }}
        >
          {t(`dashboard.machine`)}
        </span>
      </Typography>
    </Paper>
  );
}
