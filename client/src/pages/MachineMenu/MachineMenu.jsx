import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Settings as GearIcon,
  AssignmentTurnedIn as ChecksheetIcon,
  ReportProblem as WarningIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { getChecksheet } from "../../services/checksheetService";
import { useTranslation } from "react-i18next";

const MachineMenu = () => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    handleClose();
  };

  const location = useLocation();
  const navigate = useNavigate();

  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Bóc tách ID máy từ link QR (?machine=...)
    const searchParams = new URLSearchParams(location.search);
    const machineId = searchParams.get("machine");

    if (machineId) {
      // Tận dụng API lấy thông tin máy có sẵn của bạn
      getChecksheet(machineId)
        .then((res) => {
          setMachine(res.machine);
          setLoading(false);
        })
        .catch(() => {
          setError("Không tìm thấy thông tin thiết bị này.");
          setLoading(false);
        });
    } else {
      setError("Mã QR không hợp lệ hoặc thiếu thông tin thiết bị.");
      setLoading(false);
    }
  }, [location]);

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "5px",
          marginTop: "50px",
          color: "#64748b",
        }}
      >
        Đang nhận diện thiết bị...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          color: "#ef4444",
          textAlign: "center",
          padding: "20px",
          fontWeight: "bold",
        }}
      >
        ❌ {error}
      </div>
    );

  return (
    <Box
      sx={{
        maxWidth: 450,
        margin: "20px auto",
        padding: 2,
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* KHU VỰC HIỂN THỊ THÔNG TIN MÁY ĐƯỢC QUÉT */}
      {machine && (
        <Card
          variant="outlined"
          sx={{
            textAlign: "center",
            marginBottom: 4,
            backgroundColor: "#f8fafc",
            padding: 3,
            borderRadius: 3,
            borderColor: "#e2e8f0",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "5px",
              right: "5px",
              zIndex: 10,
            }}
          >
            <IconButton color="inherit" onClick={handleClick}>
              <LanguageIcon />
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem
                selected={i18n.language === "vi"}
                onClick={() => changeLanguage("vi")}
              >
                <ListItemIcon>🇻🇳</ListItemIcon>
                <ListItemText>Tiếng Việt</ListItemText>
              </MenuItem>

              <MenuItem
                selected={i18n.language === "en"}
                onClick={() => changeLanguage("en")}
              >
                <ListItemIcon>🇺🇸</ListItemIcon>
                <ListItemText>English</ListItemText>
              </MenuItem>

              <MenuItem
                selected={i18n.language === "ko"}
                onClick={() => changeLanguage("ko")}
              >
                <ListItemIcon>🇰🇷</ListItemIcon>
                <ListItemText>한국어</ListItemText>
              </MenuItem>
            </Menu>
          </Box>

          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {/* Icon bánh răng máy móc */}
            <Avatar
              sx={{
                width: 60,
                height: 60,
                backgroundColor: "#e2e8f0",
                color: "#475569",
                margin: "0 auto 16px auto",
              }}
            >
              <GearIcon sx={{ fontSize: 35 }} />
            </Avatar>

            {/* Mã máy dạng Badge (Chip) */}
            <Chip
              label={machine.machine_code}
              color="primary"
              size="small"
              sx={{
                fontWeight: "bold",
                borderRadius: 1,
                mb: 1.5,
              }}
            />

            {/* Tên máy */}
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: "bold", color: "#1e293b", mb: 0.5 }}
            >
              {machine.machine_name}
            </Typography>

            {/* Line sản xuất */}
            <Typography variant="body2" sx={{ color: "#64748b", mb: 1.5 }}>
              Line: {machine.line_no}
            </Typography>

            {/* Người phụ trách */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#334155" }}
            >
              {t(`machinemenu.manage`)}: {machine.approver_name}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Dòng hướng dẫn */}
      <Typography
        variant="body1"
        align="center"
        sx={{
          color: "#475569",
          fontSize: "15px",
          marginBottom: 2.5,
        }}
      >
        {t(`machinemenu.selecttask`)}:
      </Typography>

      {/* KHU VỰC CÁC LỰA CHỌN HÀNH ĐỘNG */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* LỰA CHỌN 1: LÀM CHECKSHEET */}
        <Box
          onClick={() => navigate(`/checksheet?machine=${machine?.machine_id}`)}
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            backgroundColor: "#10b981",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
            transition: "all 0.2s ease-in-out",
            userSelect: "none",
            "&:hover": {
              backgroundColor: "#059669",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(1px)",
              boxShadow: "0 2px 6px rgba(16, 185, 129, 0.2)",
            },
          }}
        >
          {/* Vòng tròn Icon */}
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "#fff",
              width: 46,
              height: 46,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginRight: 2, // Khoảng cách cứng bằng margin thay vì gap
            }}
          >
            <ChecksheetIcon sx={{ fontSize: 26 }} />
          </Box>

          {/* Phần chữ */}
          <Box sx={{ display: "block", textAlign: "left" }}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "16px",
                color: "#ffffff",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {t(`machinemenu.checksheet`)}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: "#a7f3d0",
                mt: 0.5,
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {t(`machinemenu.deschecksheet`)}
            </Typography>
          </Box>
        </Box>

        {/* LỰA CHỌN 2: BÁO CÁO SỰ CỐ (TICKET) */}
        <Box
          onClick={() =>
            navigate(`/create-ticket?machine=${machine?.machine_id}`)
          }
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            backgroundColor: "#ef4444",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
            transition: "all 0.2s ease-in-out",
            userSelect: "none",
            "&:hover": {
              backgroundColor: "#dc2626",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(1px)",
              boxShadow: "0 2px 6px rgba(239, 68, 68, 0.2)",
            },
          }}
        >
          {/* Vòng tròn Icon */}
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "#fff",
              width: 46,
              height: 46,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginRight: 2,
            }}
          >
            <WarningIcon sx={{ fontSize: 26 }} />
          </Box>

          {/* Phần chữ */}
          <Box sx={{ display: "block", textAlign: "left" }}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "16px",
                color: "#ffffff",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {t(`machinemenu.report`)}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: "#fca5a5",
                mt: 0.5,
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {t(`machinemenu.desreport`)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MachineMenu;
