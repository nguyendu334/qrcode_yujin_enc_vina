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
        flexDirection: { xs: "column", lg: "row" },
        flexWrap: { xs: "nowrap", lg: "wrap" },
        gap: 2,
        alignItems: { xs: "stretch", lg: "flex-end" },
        mb: 3,
        backgroundColor: "#f8fafc",
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: "1px solid #e2e8f0",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {/* CHỌN THIẾT BỊ */}
      <FormControl
        size="small"
        fullWidth
        sx={{
          minWidth: 0,
          flex: { xs: "1 1 auto", lg: "0 1 220px" },
        }}
      >
        <InputLabel
          id="select-machine-label"
          sx={{ fontWeight: "bold", color: "#475569" }}
        >
          {t("report.selectmachine")}
        </InputLabel>

        <Select
          labelId="select-machine-label"
          value={selectedMachine}
          onChange={(e) => setSelectedMachine(e.target.value)}
          label={t("report.selectmachine")}
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: 1,
          }}
        >
          <MenuItem value="">
            <em>-- {t("report.selectmachine")} --</em>
          </MenuItem>

          {machines.map((m) => (
            <MenuItem key={m.machine_id} value={m.machine_id}>
              {m.machine_code} - {m.machine_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* CHỌN THÁNG */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          width: { xs: "100%", lg: 170 },
          minWidth: 0,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: "bold",
            color: "#475569",
          }}
        >
          {t("report.month")}
        </Typography>

        <Box
          component="input"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          sx={{
            width: "100%",
            minWidth: 0,
            height: 40,
            px: 1.5,
            boxSizing: "border-box",
            borderRadius: 1,
            border: "1px solid #cbd5e1",
            fontFamily: "inherit",
            fontSize: "14px",
            backgroundColor: "#ffffff",
            color: "#334155",
            outline: "none",
            "&:focus": {
              borderColor: "#2563eb",
              boxShadow: "0 0 0 1px #2563eb",
            },
          }}
        />
      </Box>

      {/* NÚT XEM BÁO CÁO */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleFetchReport}
        disabled={loading}
        fullWidth
        startIcon={
          loading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <ViewIcon />
          )
        }
        sx={{
          width: { xs: "100%", lg: "auto" },
          minWidth: { lg: 150 },
          height: 40,
          px: 2.5,
          fontWeight: "bold",
          textTransform: "none",
          whiteSpace: "nowrap",
          boxShadow: "none",
        }}
      >
        {loading ? "Đang tải..." : t("report.viewreport")}
      </Button>

      {/* CÁC NÚT XUẤT FILE */}
      {reportData.length > 0 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            width: { xs: "100%", lg: "auto" },
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            onClick={exportToExcel}
            startIcon={<ExcelIcon />}
            sx={{
              flex: { xs: 1, sm: "0 1 auto" },
              minWidth: 0,
              height: 40,
              px: { xs: 1, sm: 2 },
              backgroundColor: "#16a34a",
              "&:hover": {
                backgroundColor: "#15803d",
              },
              fontWeight: "bold",
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: "none",
            }}
          >
            {t("report.exportexcel")}
          </Button>

          <Button
            variant="contained"
            onClick={exportToPDF}
            startIcon={<PdfIcon />}
            sx={{
              flex: { xs: 1, sm: "0 1 auto" },
              minWidth: 0,
              height: 40,
              px: { xs: 1, sm: 2 },
              backgroundColor: "#dc2626",
              "&:hover": {
                backgroundColor: "#b91c1c",
              },
              fontWeight: "bold",
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: "none",
            }}
          >
            {t("report.exportpdf")}
          </Button>
        </Box>
      )}

      {/* NGƯỜI DUYỆT */}
      {approvers.length > 0 && (
        <Box
          sx={{
            ml: { lg: "auto" },
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            width: { xs: "100%", lg: "auto" },
            maxWidth: "100%",
            p: 1.5,
            backgroundColor: "#e2e8f0",
            borderRadius: 1,
            boxSizing: "border-box",
            fontSize: "13px",
            color: "#334155",
            overflowWrap: "anywhere",
          }}
        >
          <ApproverIcon
            fontSize="small"
            sx={{
              flexShrink: 0,
              mt: "2px",
            }}
          />

          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="span"
              sx={{ fontSize: "13px", fontWeight: "bold" }}
            >
              {t("report.approver")}:
            </Typography>{" "}
            {approvers.join(", ")}
          </Box>
        </Box>
      )}
    </Box>
  );
}
