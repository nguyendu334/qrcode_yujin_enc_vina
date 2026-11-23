import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#f5f7fb",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isMobile={isMobile}
      />

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: isMobile ? "100%" : `calc(100% - ${collapsed ? 80 : 280}px)`,
          transition: "width 0.3s ease",
          overflowX: "hidden",
        }}
      >
        <Header
          collapsed={collapsed}
          isMobile={isMobile}
          onMenuClick={() => setMobileOpen(true)}
        />

        <Box
          component="main"
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mt: "64px",
            minHeight: "calc(100vh - 64px)",
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
