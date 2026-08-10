import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import SearchIcon from "@mui/icons-material/Search";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsIcon from "@mui/icons-material/Notifications";

// eslint-disable-next-line react/prop-types
export default function Header({ collapsed }) {
  const { i18n, t } = useTranslation();

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

  // Đồng bộ kích thước Sidebar: 80px khi thu gọn, 280px khi mở rộng
  const drawerWidth = collapsed ? 80 : 280;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="inherit"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        left: `${drawerWidth}px`, // 🌟 Sử dụng `left` để cố định viền trái sát mép Sidebar
        right: 0,
        bgcolor: "#fff",
        color: "#000",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
        zIndex: (theme) => theme.zIndex.drawer - 1, // 🌟 Nằm dưới Sidebar để không đè lên nút Toggle
        transition: (theme) =>
          theme.transitions.create(["width", "left"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
    >
      <Toolbar
        sx={{
          minHeight: "64px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 1.5, sm: 3 },
          gap: 1,
        }}
      >
        {/* 1. Tiêu đề - Tự động thu gọn chữ (thêm ...) nếu không đủ chỗ */}
        <Typography
          sx={{
            fontSize: { xs: "14px", sm: "17px", md: "20px" },
            fontWeight: "700",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
            flexShrink: 1,
          }}
        >
          {t(`header`)}
        </Typography>

        {/* 2. Cụm công cụ bên phải */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
            flexShrink: 0,
          }}
        >
          {/* Ô tìm kiếm tự thu nhỏ khi màn hình bé */}
          <TextField
            size="small"
            placeholder="Search..."
            sx={{
              width: { xs: 90, sm: 150, md: 220 },
              bgcolor: "#fff",
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <IconButton color="inherit" onClick={handleClick} size="small">
            <LanguageIcon fontSize="small" />
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

          <IconButton color="inherit" size="small">
            <NotificationsIcon fontSize="small" />
          </IconButton>

          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: "14px",
              bgcolor: "#4f46e5",
            }}
          >
            D
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
