import {
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Button,
} from "@mui/material";

import { Logout } from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
// import FactCheckIcon from "@mui/icons-material/FactCheck";
import HistoryIcon from "@mui/icons-material/History";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";

import { NavLink } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";

const width = 300;

const menus = [
  {
    name: "sidebar.dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    name: "sidebar.machine",
    icon: <PrecisionManufacturingIcon />,
    path: "/machine",
  },
  {
    name: "sidebar.history",
    icon: <HistoryIcon />,
    path: "/history",
  },
  {
    name: "sidebar.report",
    icon: <DescriptionIcon />,
    path: "/report",
  },

  {
    name: "sidebar.maintenance",
    icon: <PrecisionManufacturingIcon />,
    path: "/maintenance-management",
  },

  {
    name: "sidebar.user",
    icon: <GroupIcon />,
    path: "/user",
  },

  {
    name: "sidebar.setting",
    icon: <SettingsIcon />,
    path: "/setting",
  },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width,
          background: "#0f172a",
          color: "#fff",
          border: 0,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar
        style={{
          borderRadius: "8px",
          fontWeight: "500",
          fontSize: "14px",
          transition: "all 0.2s ease",
        }}
      >
        <Box sx={{ padding: "8px" }}>
          <Typography
            sx={{ paddingBottom: "8px", fontSize: "16px", fontWeight: "600" }}
          >
            {user?.full_name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Typography
              sx={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background:
                  user.role === "manager"
                    ? "green"
                    : user.role === "admin"
                    ? "#fef3c7"
                    : "#e0f2fe",
              }}
            ></Typography>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {user.role.toUpperCase()}
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: "#374151" }} />

      <List>
        {menus.map((menu) => (
          <ListItemButton
            component={NavLink}
            to={menu.path}
            key={menu.name}
            sx={{
              mx: 1,

              my: 0.5,

              borderRadius: 3,

              "&.active": {
                background: "#4f46e5",
              },

              "&:hover": {
                background: "#312e81",
              },
            }}
          >
            <ListItemIcon
              sx={{ color: "#fff" }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textDecoration: "none",
                padding: "4px 16px",
                borderRadius: "8px",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
            >
              {menu.icon}
            </ListItemIcon>

            <ListItemText primary={t(menu.name)} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* <Divider sx={{ borderColor: "#374151" }} /> */}

      <Button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
        sx={{
          // marginBottom: "8px",
          width: "100%",
          background: "rgba(239, 68, 68, 0.1)",
          color: "#ef4444",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          padding: "12px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "16px",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "#ef4444";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
          e.currentTarget.style.color = "#ef4444";
        }}
      >
        <Logout sx={{ paddingRight: "6px" }} /> {t("logout")}
      </Button>
    </Drawer>
  );
}
