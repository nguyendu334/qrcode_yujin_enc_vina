import { useEffect, useState } from "react";
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
  IconButton,
  Tooltip,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  Logout,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import EngineeringIcon from "@mui/icons-material/Engineering";
import HistoryIcon from "@mui/icons-material/History";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";

import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const FULL_WIDTH = 280;
const COLLAPSED_WIDTH = 80;

// Submenu của Quản lý thiết bị
const deviceSubItems = [
  {
    text: "sidebar.listMachine",
    path: "/machine",
    icon: <FormatListBulletedIcon fontSize="small" />,
  },
  {
    text: "sidebar.machineType",
    path: "/machine-types",
    icon: <CategoryIcon fontSize="small" />,
    // roles: ["manager"],
  },
  {
    text: "Hạng mục kiểm tra",
    path: "/category",
    icon: <CategoryIcon fontSize="small" />,
    roles: ["manager", "head"],
  },
  {
    text: "sidebar.area",
    path: "/locations",
    icon: <LocationOnIcon fontSize="small" />,
  },
];

// 🌟 Submenu của Quản lý người dùng
const userSubItems = [
  {
    text: "sidebar.userList",
    path: "/user",
    icon: <PersonIcon fontSize="small" />,
  },
  {
    text: "sidebar.department",
    path: "/departments",
    icon: <LocalFireDepartmentIcon fontSize="small" />,
  },
  {
    text: "sidebar.role",
    path: "/user-roles",
    icon: <AdminPanelSettingsIcon fontSize="small" />,
  },
];

const menus = [
  { name: "sidebar.dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  {
    name: "sidebar.machine",
    icon: <PrecisionManufacturingIcon />,
    path: "/machine",
    hasSubMenu: true,
    subItems: deviceSubItems,
    key: "machine",
  },
  { name: "sidebar.history", icon: <HistoryIcon />, path: "/history" },
  { name: "sidebar.report", icon: <DescriptionIcon />, path: "/report" },
  {
    name: "sidebar.maintenance",
    icon: <EngineeringIcon />,
    path: "/maintenance-management",
  },
  {
    name: "sidebar.user",
    icon: <GroupIcon />,
    path: "/user",
    roles: ["manager"],
    hasSubMenu: true, // 🌟 Bật Submenu cho User
    subItems: userSubItems,
    key: "user",
  },
  { name: "sidebar.setting", icon: <SettingsIcon />, path: "/setting" },
];

// eslint-disable-next-line react/prop-types
export default function Sidebar({ collapsed, setCollapsed }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const location = useLocation();

  // State quản lý Đóng/Mở từng Submenu
  const [openSubMenus, setOpenSubMenus] = useState({
    machine: true,
    user: true,
  });

  const toggleSubMenu = (key) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenSubMenus((prev) => ({ ...prev, [key]: true }));
    } else {
      setOpenSubMenus((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const isTabletOrMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setCollapsed(isTabletOrMobile);
  }, [isTabletOrMobile, setCollapsed]);

  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : [user?.role].filter(Boolean);

  const hasAccess = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.some((role) =>
      userRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase()),
    );
  };

  const currentWidth = collapsed ? COLLAPSED_WIDTH : FULL_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: currentWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        "& .MuiDrawer-paper": {
          width: currentWidth,
          background: "#0f172a",
          color: "#fff",
          border: 0,
          overflowX: "hidden",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {/* Header Info & Toggle Button */}
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: 1.5,
          py: 1,
        }}
      >
        {!collapsed && (
          <Box sx={{ overflow: "hidden" }}>
            <Typography
              sx={{ fontSize: "15px", fontWeight: "600", whiteSpace: "nowrap" }}
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
                    user?.role === "manager"
                      ? "green"
                      : user?.role === "admin"
                        ? "#fef3c7"
                        : "#e0f2fe",
                }}
              />
              <Typography sx={{ fontSize: "12px", fontWeight: "700" }}>
                {user?.role?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )}

        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>

      <Divider sx={{ borderColor: "#374151" }} />

      {/* Danh sách Menu */}
      <List sx={{ px: 1, py: 1 }}>
        {menus
          .filter((menu) => hasAccess(menu.roles))
          .map((menu) => {
            // Cấu trúc chung cho các Menu có Submenu (Machine, User...)
            if (menu.hasSubMenu) {
              const isSubActive = menu.subItems.some(
                (sub) => sub.path === location.pathname,
              );
              const isOpen = openSubMenus[menu.key];

              return (
                <Box key={menu.name}>
                  <ListItemButton
                    onClick={() => toggleSubMenu(menu.key)}
                    sx={{
                      my: 0.5,
                      borderRadius: 2,
                      justifyContent: collapsed ? "center" : "initial",
                      px: collapsed ? 1.5 : 2,
                      background: isSubActive
                        ? "rgba(79, 70, 229, 0.2)"
                        : "transparent",
                      "&:hover": { background: "#312e81" },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isSubActive ? "#818cf8" : "#fff",
                        minWidth: 0,
                        mr: collapsed ? 0 : 2,
                        justifyContent: "center",
                      }}
                    >
                      {menu.icon}
                    </ListItemIcon>

                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={t(menu.name)}
                          primaryTypographyProps={{
                            fontSize: "14px",
                            fontWeight: isSubActive ? 600 : 500,
                            color: isSubActive ? "#818cf8" : "#fff",
                          }}
                        />
                        {isOpen ? (
                          <ExpandLess sx={{ color: "#94a3b8" }} />
                        ) : (
                          <ExpandMore sx={{ color: "#94a3b8" }} />
                        )}
                      </>
                    )}
                  </ListItemButton>

                  <Collapse
                    in={isOpen && !collapsed}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {menu.subItems
                        .filter((menu) => hasAccess(menu.roles))
                        .map((sub) => (
                          <ListItemButton
                            key={sub.path}
                            component={NavLink}
                            to={sub.path}
                            sx={{
                              my: 0.3,
                              pl: 4,
                              borderRadius: 2,
                              "&.active": {
                                background: "#4f46e5",
                                color: "#fff",
                              },
                              "&:hover": {
                                background: "rgba(255, 255, 255, 0.08)",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                color: "#94a3b8",
                                minWidth: "28px",
                                ".active &": { color: "#fff" },
                              }}
                            >
                              {sub.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={t(sub.text)}
                              primaryTypographyProps={{
                                fontSize: "13px",
                                fontWeight: 400,
                              }}
                            />
                          </ListItemButton>
                        ))}
                    </List>
                  </Collapse>
                </Box>
              );
            }

            // Menu đơn lẻ không có Submenu
            const buttonContent = (
              <ListItemButton
                component={NavLink}
                to={menu.path}
                key={menu.name}
                sx={{
                  my: 0.5,
                  borderRadius: 2,
                  justifyContent: collapsed ? "center" : "initial",
                  px: collapsed ? 1.5 : 2,
                  "&.active": { background: "#4f46e5" },
                  "&:hover": { background: "#312e81" },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "#fff",
                    minWidth: 0,
                    mr: collapsed ? 0 : 2,
                    justifyContent: "center",
                  }}
                >
                  {menu.icon}
                </ListItemIcon>

                {!collapsed && (
                  <ListItemText
                    primary={t(menu.name)}
                    primaryTypographyProps={{
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  />
                )}
              </ListItemButton>
            );

            return collapsed ? (
              <Tooltip title={t(menu.name)} placement="right" key={menu.name}>
                {buttonContent}
              </Tooltip>
            ) : (
              buttonContent
            );
          })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Nút Đăng xuất */}
      <Box sx={{ p: 1.5, mt: "auto" }}>
        <Button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          sx={{
            width: "100%",
            minWidth: 0,
            height: "44px",
            borderRadius: "10px",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: "#f87171",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            justifyContent: "center",
            px: collapsed ? 0 : 2,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              background: "#ef4444",
              color: "#ffffff",
              borderColor: "#ef4444",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            },
          }}
        >
          <Logout
            sx={{
              fontSize: "20px",
              mr: collapsed ? 0 : 1.5,
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <Box component="span" sx={{ whiteSpace: "nowrap" }}>
              {t("logout")}
            </Box>
          )}
        </Button>
      </Box>
    </Drawer>
  );
}
