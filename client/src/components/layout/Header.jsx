/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { useTranslation } from "react-i18next";

import LanguageIcon from "@mui/icons-material/Language";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";

// eslint-disable-next-line react/prop-types
export default function Header({
  collapsed,
  isMobile: isMobileProp,
  onMenuClick,
}) {
  const { i18n, t } = useTranslation();
  const theme = useTheme();

  const mediaIsMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = isMobileProp ?? mediaIsMobile;

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

  const drawerWidth = collapsed ? 80 : 280;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="inherit"
      sx={{
        width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
        left: isMobile ? 0 : `${drawerWidth}px`,
        right: 0,
        bgcolor: "#fff",
        color: "#000",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
        zIndex: theme.zIndex.drawer - 1,
        transition: theme.transitions.create(["width", "left"], {
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
        {/* Nút mở Sidebar trên mobile */}
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{
              flexShrink: 0,
              mr: 0.5,
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Tiêu đề */}
        <Typography
          sx={{
            fontSize: { xs: "14px", sm: "17px", md: "20px" },
            fontWeight: 700,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
            flex: 1,
          }}
        >
          {t("header")}
        </Typography>

        {/* Cụm công cụ bên phải */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
            flexShrink: 0,
          }}
        >
          {/* Tìm kiếm */}
          {/* <TextField
            size="small"
            placeholder="Search..."
            sx={{
              width: {
                xs: 85,
                sm: 150,
                md: 220,
              },
              bgcolor: "#fff",
              "& .MuiInputBase-input": {
                fontSize: { xs: "12px", sm: "14px" },
              },
              "& .MuiInputBase-root": {
                height: 36,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          /> */}

          {/* Chọn ngôn ngữ */}
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

          {/* Thông báo */}
          <IconButton color="inherit" size="small">
            <NotificationsIcon fontSize="small" />
          </IconButton>

          {/* Avatar */}
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
