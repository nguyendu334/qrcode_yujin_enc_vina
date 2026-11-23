/* eslint-disable react/prop-types */
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
import TypeSpecimenIcon from "@mui/icons-material/TypeSpecimen";
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

// Submenu quản lý thiết bị
const deviceSubItems = [
  {
    text: "sidebar.listMachine",
    path: "/machine",
    icon: <FormatListBulletedIcon fontSize="small" />,
    roles: ["manager", "head"],
  },
  {
    text: "sidebar.machineType",
    path: "/machine-types",
    icon: <TypeSpecimenIcon fontSize="small" />,
    roles: ["manager", "head"],
  },
  {
    text: "sidebar.category",
    path: "/category",
    icon: <CategoryIcon fontSize="small" />,
    roles: ["manager", "head"],
  },
  {
    text: "sidebar.area",
    path: "/locations",
    icon: <LocationOnIcon fontSize="small" />,
    roles: ["manager", "head"],
  },
];

// Submenu quản lý người dùng
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
  {
    name: "sidebar.dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    name: "sidebar.machine",
    icon: <PrecisionManufacturingIcon />,
    path: "/machine",
    hasSubMenu: true,
    subItems: deviceSubItems,
    key: "machine",
    roles: ["manager", "head"],
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
    icon: <EngineeringIcon />,
    path: "/maintenance-management",
  },
  {
    name: "sidebar.user",
    icon: <GroupIcon />,
    path: "/user",
    roles: ["manager"],
    hasSubMenu: true,
    subItems: userSubItems,
    key: "user",
  },
  {
    name: "sidebar.setting",
    icon: <SettingsIcon />,
    path: "/setting",
  },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen = () => {},
  isMobile: isMobileProp,
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const location = useLocation();

  const mediaIsMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = isMobileProp ?? mediaIsMobile;

  const [openSubMenus, setOpenSubMenus] = useState({
    machine: true,
    user: true,
  });

  // Khi chuyển sang desktop thì đóng Drawer mobile
  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile, setMobileOpen]);

  // Tự mở submenu nếu đang ở trang con tương ứng
  useEffect(() => {
    setOpenSubMenus((prev) => ({
      ...prev,
      machine:
        prev.machine ||
        deviceSubItems.some((item) => item.path === location.pathname),
      user:
        prev.user ||
        userSubItems.some((item) => item.path === location.pathname),
    }));
  }, [location.pathname]);

  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : [user?.role].filter(Boolean);

  const hasAccess = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;

    return allowedRoles.some((role) =>
      userRoles
        .map((r) => String(r).toLowerCase())
        .includes(role.toLowerCase()),
    );
  };

  const currentWidth = collapsed ? COLLAPSED_WIDTH : FULL_WIDTH;

  const handleCloseMobile = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const toggleSubMenu = (key) => {
    if (isMobile) {
      setOpenSubMenus((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
      return;
    }

    if (collapsed) {
      setCollapsed(false);
      setOpenSubMenus((prev) => ({
        ...prev,
        [key]: true,
      }));
    } else {
      setOpenSubMenus((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={handleCloseMobile}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: isMobile ? FULL_WIDTH : currentWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        "& .MuiDrawer-paper": {
          width: isMobile ? FULL_WIDTH : currentWidth,
          background: "#0f172a",
          color: "#fff",
          border: 0,
          overflowX: "hidden",
          boxSizing: "border-box",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {/* Header thông tin người dùng */}
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: !isMobile && collapsed ? "center" : "space-between",
          px: 1.5,
          py: 1,
          minHeight: "64px",
        }}
      >
        {(!collapsed || isMobile) && (
          <Box sx={{ overflow: "hidden" }}>
            <Typography
              sx={{
                fontSize: "15px",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {user?.full_name}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    user?.role === "manager"
                      ? "green"
                      : user?.role === "admin"
                        ? "#fef3c7"
                        : "#e0f2fe",
                }}
              />

              <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>
                {user?.role?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )}

        {!isMobile && (
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              color: "#94a3b8",
              "&:hover": { color: "#fff" },
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: "#374151" }} />

      {/* Danh sách menu */}
      <List sx={{ px: 1, py: 1 }}>
        {menus
          .filter((menu) => hasAccess(menu.roles))
          .map((menu) => {
            const isCollapsed = !isMobile && collapsed;

            // Menu có submenu
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
                      justifyContent: isCollapsed ? "center" : "initial",
                      px: isCollapsed ? 1.5 : 2,
                      background: isSubActive
                        ? "rgba(79, 70, 229, 0.2)"
                        : "transparent",
                      "&:hover": {
                        background: "#312e81",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isSubActive ? "#818cf8" : "#fff",
                        minWidth: 0,
                        mr: isCollapsed ? 0 : 2,
                        justifyContent: "center",
                      }}
                    >
                      {menu.icon}
                    </ListItemIcon>

                    {!isCollapsed && (
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
                    in={isOpen && !isCollapsed}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {menu.subItems
                        .filter((sub) => hasAccess(sub.roles))
                        .map((sub) => (
                          <ListItemButton
                            key={sub.path}
                            component={NavLink}
                            to={sub.path}
                            onClick={handleCloseMobile}
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
                                ".active &": {
                                  color: "#fff",
                                },
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

            // Menu đơn
            const buttonContent = (
              <ListItemButton
                component={NavLink}
                to={menu.path}
                onClick={handleCloseMobile}
                sx={{
                  my: 0.5,
                  borderRadius: 2,
                  justifyContent: isCollapsed ? "center" : "initial",
                  px: isCollapsed ? 1.5 : 2,
                  "&.active": {
                    background: "#4f46e5",
                  },
                  "&:hover": {
                    background: "#312e81",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "#fff",
                    minWidth: 0,
                    mr: isCollapsed ? 0 : 2,
                    justifyContent: "center",
                  }}
                >
                  {menu.icon}
                </ListItemIcon>

                {!isCollapsed && (
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

            return isCollapsed ? (
              <Tooltip title={t(menu.name)} placement="right" key={menu.name}>
                {buttonContent}
              </Tooltip>
            ) : (
              <Box key={menu.name}>{buttonContent}</Box>
            );
          })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Nút đăng xuất */}
      <Box sx={{ p: 1.5, mt: "auto" }}>
        <Button
          onClick={handleLogout}
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
            px: !isMobile && collapsed ? 0 : 2,
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
              mr: !isMobile && collapsed ? 0 : 1.5,
              flexShrink: 0,
            }}
          />

          {(!collapsed || isMobile) && (
            <Box component="span" sx={{ whiteSpace: "nowrap" }}>
              {t("logout")}
            </Box>
          )}
        </Button>
      </Box>
    </Drawer>
  );
}
