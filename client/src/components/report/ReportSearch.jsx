/* eslint-disable react/prop-types */
import {
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  FileDownload as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Visibility as ViewIcon,
  SupervisorAccount as ApproverIcon,
} from "@mui/icons-material";

export default function ReportSearch({
  t,
  selectedMachine,
  setSelectedMachine,
  machines,
  selectedMonth,
  setSelectedMonth,
  handleFetchReport,
  loading,
  reportData,
  exportToExcel,
  exportToPDF,
  approvers,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        alignItems: { xs: "stretch", md: "flex-end" },
        mb: 3,
        backgroundColor: "#f8fafc",
        padding: 2,
        borderRadius: 2,
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Chọn thiết bị */}
      <FormControl
        size="small"
        sx={{ minWidth: 200, flex: { xs: 1, md: "none" } }}
      >
        <InputLabel
          id="select-machine-label"
          sx={{ fontWeight: "bold", color: "#475569" }}
        >
          {t(`report.selectmachine`)}
        </InputLabel>
        <Select
          labelId="select-machine-label"
          value={selectedMachine}
          onChange={(e) => setSelectedMachine(e.target.value)}
          label={t(`report.selectmachine`)}
          sx={{ backgroundColor: "#ffffff" }}
        >
          <MenuItem value="">
            <em>-- {t(`report.selectmachine`)} --</em>
          </MenuItem>
          {machines.map((m) => (
            <MenuItem key={m.machine_id} value={m.machine_id}>
              {m.machine_code} - {m.machine_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Chọn tháng */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          minWidth: 150,
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: "bold", color: "#475569" }}
        >
          {t(`report.month`)}
        </Typography>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            padding: "8.5px 14px",
            borderRadius: "4px",
            border: "1px solid #cbd5e1",
            fontFamily: "inherit",
            fontSize: "14px",
            backgroundColor: "#ffffff",
          }}
        />
      </Box>

      {/* Nút Xem Báo Cáo */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleFetchReport}
        disabled={loading}
        startIcon={
          loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <ViewIcon />
          )
        }
        sx={{
          fontWeight: "bold",
          textTransform: "none",
          height: "40px",
          px: 3,
        }}
      >
        {loading ? "Đang tải..." : t("report.viewreport")}
      </Button>

      {/* CÁC NÚT XUẤT FILE (Chỉ hiện khi có dữ liệu) */}
      {reportData.length > 0 && (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={exportToExcel}
            startIcon={<ExcelIcon />}
            sx={{
              backgroundColor: "#16a34a",
              "&:hover": { backgroundColor: "#15803d" },
              fontWeight: "bold",
              textTransform: "none",
              height: "40px",
            }}
          >
            {t(`report.exportexcel`)}
          </Button>

          <Button
            variant="contained"
            onClick={exportToPDF}
            startIcon={<PdfIcon />}
            sx={{
              backgroundColor: "#dc2626",
              "&:hover": { backgroundColor: "#b91c1c" },
              fontWeight: "bold",
              textTransform: "none",
              height: "40px",
            }}
          >
            {t(`report.exportpdf`)}
          </Button>
        </Box>
      )}

      {/* KHU VỰC NGƯỜI DUYỆT (Tự động đẩy về bên phải trên PC) */}
      {approvers.length > 0 && (
        <Box
          sx={{
            marginLeft: { md: "auto" },
            display: "flex",
            alignItems: "center",
            gap: 1,
            padding: "8px 16px",
            backgroundColor: "#e2e8f0",
            borderRadius: 1,
            fontSize: "13px",
            color: "#334155",
          }}
        >
          <ApproverIcon fontSize="small" />
          <Box>
            <strong>{t(`report.approver`)}:</strong> {approvers.join(", ")}
          </Box>
        </Box>
      )}
    </Box>
  );
}
