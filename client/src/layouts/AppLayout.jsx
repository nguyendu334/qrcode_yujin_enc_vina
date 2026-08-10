import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Box sx={{ display: "flex", bgcolor: "#f5f7fb", minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <Box
        sx={{
          flexGrow: 1,
          flex: 1,
          width: `calc(100% - ${collapsed ? 80 : 280}px)`,
          transition: "width 0.3s ease",
          overflowX: "hidden",
        }}
      >
        <Header collapsed={collapsed} />

        <Box
          component="main"
          sx={{
            p: 4,
            mt: "64px",
          }}
        >
          <Outlet />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
