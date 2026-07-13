import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

export default function AppLayout() {
  return (
    <Box sx={{ display: "flex", bgcolor: "#f5f7fb" }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          flex: 1,
          minHeight: "100vh",
        }}
      >
        <Header />

        <Box
          sx={{
            p: 4,
            mt: "64px",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
