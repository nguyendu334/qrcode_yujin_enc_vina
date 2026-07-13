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

export default function Header() {
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

  const drawerWidth = 300;
  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="inherit"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        bgcolor: "#fff",
        color: "#000",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: "64px",
        }}
      >
        <Typography
          sx={{
            fontSize: "24px",
            fontWeight: "700",
          }}
        >
          {t(`header`)}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <TextField
          size="small"
          placeholder="Search..."
          sx={{
            mr: 3,

            width: 260,

            bgcolor: "#fff",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <>
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
        </>

        <IconButton>
          <NotificationsIcon />
        </IconButton>

        <Avatar
          sx={{
            ml: 2,

            bgcolor: "#4f46e5",
          }}
        >
          D
        </Avatar>
      </Toolbar>
    </AppBar>
  );
}
