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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SearchIcon from "@mui/icons-material/Search";

import { useTranslation } from "react-i18next";

import { getDashboard } from "../../services/dashboardService";
import { getInspectionDetail } from "../../services/inspectionService";

export default function Dashboard() {
  const { t } = useTranslation();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

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

  // --- STATE DÀNH CHO Ô TÌM KIẾM ---
  const [searchTerm, setSearchTerm] = useState("");

  // --- STATE DÀNH CHO DIALOG DETAIL ---
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [inspectionItems, setInspectionItems] = useState([]);

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

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filterList = (list) => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase().trim();
    return list.filter((item) => {
      const dept = (
        item.department_name ||
        item.department ||
        ""
      ).toLowerCase();
      const location = (item.location || item.line_name || "").toLowerCase();
      const code = (item.machine_code || "").toLowerCase();
      const name = (item.machine_name || "").toLowerCase();
      const inspector = (item.inspector || item.created_by || "").toLowerCase();
      const manager = (
        item.manager ||
        item.person_in_charge ||
        ""
      ).toLowerCase();

      return (
        dept.includes(term) ||
        location.includes(term) ||
        code.includes(term) ||
        name.includes(term) ||
        inspector.includes(term) ||
        manager.includes(term)
      );
    });
  };

  const filteredCheckedList = filterList(checkedList);
  const filteredUncheckedList = filterList(uncheckedList);

  // Hàm gọi API lấy chi tiết khi nhấp vào Chip Status
  const handleOpenDetail = async (inspectionId) => {
    if (!inspectionId) return;
    setOpenDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await getInspectionDetail(inspectionId);
      if (res.success && res.data && res.data.length > 0) {
        // Lấy thông tin trạng thái & người duyệt từ dòng dữ liệu đầu tiên
        setSelectedHeader({
          approver_name: res.data[0].approver_name,
          approval_status: res.data[0].approval_status,
        });
        setInspectionItems(res.data);
      } else {
        setSelectedHeader(null);
        setInspectionItems([]);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết phiếu kiểm tra:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setOpenDetailModal(false);
    setSelectedHeader(null);
    setInspectionItems([]);
  };

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
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        // p: {
        //   xs: 1.5,
        //   sm: 2.5,
        //   md: 3,
        //   lg: 4,
        // },
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          justifyContent: "space-between",
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          gap: 2,
          mb: {
            xs: 2.5,
            md: 3,
          },
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              mb: 0.5,
              fontSize: {
                xs: "1.2rem",
                sm: "1.4rem",
                md: "1.5rem",
              },
              lineHeight: 1.3,
              overflowWrap: "break-word",
            }}
          >
            {t("dashboard.title")}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              fontSize: {
                xs: "0.78rem",
                sm: "0.875rem",
              },
              lineHeight: 1.5,
            }}
          >
            {t("dashboard.content")} ({t(`dashboard.${stats.currentShift}`)})
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            px: 1.5,
            py: 1,
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontWeight: 600,
            color: "#475569",
            fontSize: {
              xs: "0.8rem",
              sm: "0.875rem",
            },
            display: "flex",
            alignItems: "center",
            alignSelf: {
              xs: "flex-start",
              sm: "center",
            },
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          📅 {t("dashboard.today")}: {new Date().toLocaleDateString("vi-VN")}
        </Paper>
      </Box>

      {/* KPI CARDS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: {
            xs: 1.5,
            sm: 2,
          },
          mb: {
            xs: 2.5,
            md: 3,
          },
        }}
      >
        <CardKPI
          t={t}
          title={t("dashboard.online")}
          value={stats.activeMachines}
          color="#3b82f6"
        />

        <CardKPI
          t={t}
          title={t("dashboard.offline")}
          value={stats.stoppedMachines}
          color="#94a3b8"
        />

        <CardKPI
          t={t}
          title={t("dashboard.checkedtoday")}
          value={stats.checkedMachines}
          color="#10b981"
        />

        <CardKPI
          t={t}
          title={t("dashboard.await")}
          value={stats.uncheckedMachines}
          color="#ef4444"
          isWarning={stats.uncheckedMachines > 0}
        />
      </Box>

      {/* Ô TÌM KIẾM DỮ LIỆU BẢNG */}
      <Box sx={{ mb: 2, maxWidth: 350 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t("dashboard.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": {
                borderColor: "#e2e8f0",
              },
              "&:hover fieldset": {
                borderColor: "#cbd5e1",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#3b82f6",
              },
            },
          }}
        />
      </Box>

      {/* BẢNG DANH SÁCH MÁY ĐÃ CHECK & CHƯA CHECK */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          overflow: "hidden",
          width: "100%",
          minWidth: 0,
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
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                minWidth: "auto",
                px: {
                  xs: 1.5,
                  sm: 2,
                },
                fontSize: {
                  xs: "0.75rem",
                  sm: "0.875rem",
                },
              },
            }}
          >
            <Tab
              label={`${t(`dashboard.checkedtoday`)} (${filteredCheckedList.length})`}
              sx={{ fontWeight: "600", textTransform: "none" }}
            />
            <Tab
              label={`${t(`dashboard.await`)} (${filteredUncheckedList.length})`}
              sx={{
                fontWeight: "600",
                textTransform: "none",
                color: filteredUncheckedList.length > 0 ? "#ef4444" : "inherit",
              }}
            />
          </Tabs>
        </Box>

        {/* TAB 1: DANH SÁCH MÁY ĐÃ CHECK */}
        {activeTab === 0 && (
          <TableContainer
            sx={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Table
              sx={{
                minWidth: {
                  xs: 850,
                  md: 1000,
                },
                "& .MuiTableCell-root": {
                  px: {
                    xs: 1,
                    sm: 2,
                  },
                  py: {
                    xs: 1.2,
                    sm: 1.5,
                  },
                  fontSize: {
                    xs: "0.75rem",
                    sm: "0.875rem",
                  },
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.stt`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.department`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.area`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.code`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.name`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.inspector`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.manager`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.status`)}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCheckedList.map((item, index) => {
                  const statusVal =
                    item.approval_status || item.status || "pending";
                  const isApproved = statusVal === "approved";
                  const hasNG = item.has_ng === true;

                  return (
                    <TableRow
                      key={item.machine_id || index}
                      hover
                      sx={{
                        // 💡 Nếu có lỗi NG thì tô nền màu đỏ nhạt, chữ màu đỏ nhạt để cảnh báo
                        backgroundColor: hasNG ? "#fee2e2" : "inherit",
                        "&:hover": {
                          backgroundColor: hasNG
                            ? "#fee2e2 !important"
                            : undefined,
                        },
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {item.department_name || item.department || "—"}
                      </TableCell>
                      <TableCell>
                        {item.location || item.line_name || "—"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {hasNG && (
                            <ErrorOutlineOutlinedIcon
                              fontSize="small"
                              sx={{
                                color: "#ef4444",
                                animation: "blink 1.5s infinite",
                              }}
                            />
                          )}
                          <span
                            style={{ color: hasNG ? "#b91c1c" : "inherit" }}
                          >
                            {item.machine_code}
                          </span>
                        </Box>
                      </TableCell>
                      <TableCell>{item.machine_name}</TableCell>
                      <TableCell>
                        {item.inspector || item.created_by || "—"}
                      </TableCell>
                      <TableCell>
                        {item.manager || item.person_in_charge || "—"}
                      </TableCell>
                      <TableCell>
                        {/* Chip clickable mở Dialog chi tiết */}
                        <Chip
                          icon={
                            isApproved ? (
                              <CheckCircleOutlineOutlinedIcon fontSize="small" />
                            ) : (
                              <HourglassEmptyIcon fontSize="small" />
                            )
                          }
                          label={statusVal}
                          color={isApproved ? "success" : "warning"}
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenDetail(item.inspection_id)}
                          sx={{
                            cursor: "pointer",
                            fontWeight: "600",
                            "&:hover": {
                              backgroundColor: isApproved
                                ? "#f0fdf4"
                                : "#fff7ed",
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredCheckedList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 3, color: "#94a3b8" }}
                    >
                      {searchTerm
                        ? "Không tìm thấy thiết bị khớp với từ khóa."
                        : "Chưa có máy nào được kiểm tra trong ca này."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 2: DANH SÁCH MÁY CHƯA CHECK */}
        {activeTab === 1 && (
          <TableContainer
            sx={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Table
              sx={{
                minWidth: {
                  xs: 850,
                  md: 1000,
                },
                "& .MuiTableCell-root": {
                  px: {
                    xs: 1,
                    sm: 2,
                  },
                  py: {
                    xs: 1.2,
                    sm: 1.5,
                  },
                  fontSize: {
                    xs: "0.75rem",
                    sm: "0.875rem",
                  },
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.stt`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.department`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.area`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.code`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.name`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.inspector`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.manager`)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t(`dashboard.status`)}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUncheckedList.map((item, index) => (
                  <TableRow
                    key={item.machine_id || index}
                    hover
                    sx={{ backgroundColor: "#fef2f2" }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {item.department_name || item.department || "—"}
                    </TableCell>
                    <TableCell>
                      {item.location || item.line_name || "—"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#b91c1c" }}>
                      {item.machine_code}
                    </TableCell>
                    <TableCell sx={{ color: "#7f1d1d" }}>
                      {item.machine_name}
                    </TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>
                      {item.manager || item.person_in_charge || "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<ErrorOutlineOutlinedIcon fontSize="small" />}
                        label={t(`dashboard.await`)}
                        color="error"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUncheckedList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 3, color: "#10b981", fontWeight: "600" }}
                    >
                      {searchTerm
                        ? "Không tìm thấy thiết bị khớp với từ khóa."
                        : "🎉 Tuyệt vời! Tất cả thiết bị trong ca đã hoàn thành kiểm tra."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ================= DIALOG CHI TIẾT NỘI DUNG ĐÃ CHECK ================= */}
      <Dialog
        open={openDetailModal}
        onClose={handleCloseDetail}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        sx={{
          "& .MuiDialog-paper": {
            margin: {
              xs: 0,
              sm: 2,
            },
            width: {
              xs: "100%",
              sm: "calc(100% - 32px)",
            },
            maxHeight: {
              xs: "100%",
              sm: "calc(100% - 64px)",
            },
            borderRadius: {
              xs: 0,
              sm: 2,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "700" }}>
            {t(`dashboard.detail`)}:{" "}
          </Typography>
          <IconButton onClick={handleCloseDetail}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: {
              xs: 1.5,
              sm: 3,
            },
            overflowX: "auto",
          }}
        >
          {detailLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* BANNER THÔNG TIN TRẠNG THÁI & NGƯỜI PHỤ TRÁCH/DUYỆT */}
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: "8px",
                  backgroundColor:
                    selectedHeader?.approval_status === "approved"
                      ? "#f0fdf4"
                      : "#fffbe6",
                  border:
                    selectedHeader?.approval_status === "approved"
                      ? "1px solid #bbf7d0"
                      : "1px solid #ffe58f",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "600",
                    color:
                      selectedHeader?.approval_status === "approved"
                        ? "#15803d"
                        : "#854d0e",
                  }}
                >
                  {t(`dashboard.status`)}:
                </Typography>
                <Chip
                  icon={
                    selectedHeader?.approval_status === "approved" ? (
                      <CheckCircleOutlineOutlinedIcon fontSize="small" />
                    ) : (
                      <HourglassEmptyIcon fontSize="small" />
                    )
                  }
                  label={
                    selectedHeader?.approval_status === "approved"
                      ? `$ ${t("history.approver")}: ${
                          selectedHeader?.approver_name || "Phụ trách"
                        }`
                      : `${t("history.waiting")}: ${
                          selectedHeader?.approver_name || "Phụ trách"
                        }`
                  }
                  color={
                    selectedHeader?.approval_status === "approved"
                      ? "success"
                      : "warning"
                  }
                  size="small"
                  sx={{ fontWeight: "600" }}
                />
              </Box>

              {/* BẢNG DANH SÁCH HẠNG MỤC KIỂM TRA CHI TIẾT */}
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  borderRadius: "8px",
                  overflowX: "auto",
                }}
              >
                <Table
                  size="small"
                  sx={{
                    minWidth: 600,
                  }}
                >
                  <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "700" }}>
                        {t(`history.category`)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "700" }}>
                        {t(`history.standard`)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "700" }} align="center">
                        {t(`history.result`)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "700" }} align="center">
                        {t(`history.value`)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "700" }}>
                        {t(`history.remark`)}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inspectionItems.map((detail, idx) => (
                      <TableRow key={detail.id || idx} hover>
                        <TableCell sx={{ fontWeight: "500" }}>
                          {t(`category.${detail.item}`) || "N/A"}
                        </TableCell>
                        <TableCell>
                          {t(`category_standard_value.${detail.standard}`) ||
                            "--"}
                        </TableCell>
                        <TableCell align="center">
                          {/* Nếu có giá trị số (value) thì cột Kết quả để trống '—' */}
                          {detail.value !== null &&
                          detail.value !== undefined &&
                          detail.value !== "" ? (
                            "—"
                          ) : detail.result === "OK" ? (
                            <Chip
                              label="OK"
                              color="success"
                              size="small"
                              sx={{ fontWeight: "700", minWidth: 50 }}
                            />
                          ) : detail.result === "NG" ? (
                            <Chip
                              label="NG"
                              color="error"
                              size="small"
                              sx={{ fontWeight: "700", minWidth: 50 }}
                            />
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {detail.value ?? "—"}
                        </TableCell>
                        <TableCell>{detail.remark || "—"}</TableCell>
                      </TableRow>
                    ))}
                    {inspectionItems.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{ py: 3, color: "#94a3b8" }}
                        >
                          Không tìm thấy chi tiết hạng mục kiểm tra.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDetail}
            variant="contained"
            color="primary"
          >
            {t(`dashboard.close`)}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// COMPONENT CARD KPI CON
function CardKPI({ title, value, color, isWarning, t }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 2,
          sm: 2.5,
        },
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        borderLeft: `5px solid ${color}`,
        backgroundColor: isWarning ? "#fef2f2" : "#ffffff",
        minWidth: 0,
        transition: "0.2s",
        "&:hover": {
          boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
          transform: {
            xs: "none",
            sm: "translateY(-2px)",
          },
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "#64748b",
          fontWeight: 600,
          textTransform: "uppercase",
          fontSize: {
            xs: "0.68rem",
            sm: "0.75rem",
          },
          lineHeight: 1.5,
          display: "block",
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color,
          mt: 1,
          fontSize: {
            xs: "1.75rem",
            sm: "2rem",
          },
          display: "flex",
          alignItems: "baseline",
          gap: 1,
        }}
      >
        {value}

        <Box
          component="span"
          sx={{
            fontSize: "13px",
            color: "#94a3b8",
            fontWeight: 400,
          }}
        >
          {t("dashboard.machine")}
        </Box>
      </Typography>
    </Paper>
  );
}
