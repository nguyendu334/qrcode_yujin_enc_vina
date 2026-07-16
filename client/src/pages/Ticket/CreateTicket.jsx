import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  ReportProblem as WarningIcon,
  Send as SendIcon,
} from "@mui/icons-material";

import api from "../../helper/api";
import { getChecksheet } from "../../services/checksheetService";

const CreateTicket = () => {
  const location = useLocation();
  //   const navigate = useNavigate();

  const [machine, setMachine] = useState(null);
  const [reporterName, setReporterName] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 🔍 Tự động nhận diện Máy từ mã QR (?machine=ID) giống hệt Checkshet
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const machineId = searchParams.get("machine");

    if (machineId) {
      setLoading(true);
      // Sử dụng API lấy thông tin máy có sẵn của bạn
      getChecksheet(machineId)
        .then((res) => {
          setMachine(res.machine);
          setLoading(false);
        })
        .catch(() => {
          setError("Không thể nhận diện thông tin thiết bị này từ QR.");
          setLoading(false);
        });
    } else {
      setError("Vui lòng quét mã QR trên máy để gửi yêu cầu sửa chữa!");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reporterName.trim()) {
      toast.warning("Vui lòng nhập họ tên người báo sự cố!");
      return;
    }
    if (!issueDescription.trim()) {
      toast.warning("Vui lòng mô tả chi tiết sự cố gặp phải!");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/tickets", {
        machine_id: machine.machine_id,
        reporter_name: reporterName,
        issue_description: issueDescription,
        priority: priority,
      });

      toast.success("Đã gửi Ticket báo sự cố tới đội ngũ Bảo trì thành công!");

      // Reset form sau khi gửi
      setIssueDescription("");
      setReporterName("");
      setPriority("NORMAL");
    } catch (err) {
      toast.error(
        "Gửi yêu cầu thất bại: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        Đang tải thông tin thiết bị...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          color: "#ef4444",
          textAlign: "center",
          padding: "40px",
          fontWeight: "bold",
        }}
      >
        ❌ {error}
      </div>
    );

  return (
    <Card
      elevation={3}
      sx={{
        maxWidth: 500,
        margin: "20px auto",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        backgroundColor: "#ffffff",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* TIÊU ĐỀ TRANG BÁO CÁO */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#d32f2f",
            }}
          >
            <WarningIcon sx={{ fontSize: 24 }} />
            <Typography
              variant="h6"
              component="h2"
              sx={{ fontWeight: "bold", letterSpacing: "0.5px" }}
            >
              BÁO CÁO SỰ CỐ THIẾT BỊ
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Gửi yêu cầu sửa chữa đến bộ phận kỹ thuật
          </Typography>
        </Box>

        {/* THÔNG TIN THIẾT BỊ ĐANG BỊ LỖI */}
        {machine && (
          <Box
            sx={{
              backgroundColor: "#f8fafc",
              padding: 2,
              borderRadius: 2,
              borderLeft: "4px solid #ef4444",
              marginBottom: 3,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: "#64748b",
                letterSpacing: "0.5px",
              }}
            >
              THIẾT BỊ PHÁT SINH SỰ CỐ:
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                color: "#1e293b",
                mt: 0.5,
              }}
            >
              {machine.machine_code} - {machine.machine_name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Line: {machine.line_no}
            </Typography>
          </Box>
        )}

        {/* FORM NHẬP LIỆU */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {/* Ô nhập: Người báo cáo */}
          <TextField
            label="Người phát hiện sự cố"
            required
            fullWidth
            variant="outlined"
            placeholder="Nhập tên của bạn..."
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />

          {/* Ô chọn: Mức độ khẩn cấp */}
          <TextField
            select
            label="Mức độ khẩn cấp của lỗi"
            fullWidth
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          >
            <MenuItem value="LOW">Thấp (Có thể sửa sau)</MenuItem>
            <MenuItem value="NORMAL">Bình thường (Sửa trong ca)</MenuItem>
            <MenuItem value="HIGH">
              <Box
                sx={{
                  color: "#d32f2f",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Khẩn cấp (Dừng máy, cần sửa ngay!)
              </Box>
            </MenuItem>
          </TextField>

          {/* Ô nhập: Mô tả chi tiết lỗi */}
          <TextField
            label="Mô tả hiện tượng sự cố"
            required
            fullWidth
            multiline
            rows={4}
            placeholder="Ví dụ: Máy phát ra tiếng kêu lạ, băng tải bị kẹt không quay được, màn hình điều khiển không lên nguồn..."
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />

          {/* Nút gửi báo cáo */}
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            size="large"
            endIcon={!submitting && <SendIcon />}
            sx={{
              padding: "12px",
              backgroundColor: "#ef4444",
              fontWeight: "bold",
              fontSize: "16px",
              borderRadius: "8px",
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
              "&:hover": {
                backgroundColor: "#dc2626",
              },
              "&.Mui-disabled": {
                backgroundColor: "#cbd5e1",
                color: "#94a3b8",
              },
            }}
          >
            {submitting ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Đang gửi yêu cầu...</span>
              </Box>
            ) : (
              "Gửi Yêu Cầu Hỗ Trợ"
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreateTicket;
