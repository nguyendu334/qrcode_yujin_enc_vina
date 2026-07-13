// import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/inter";
import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import theme from "./theme/index";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";

import "./i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <App />
    </AuthProvider>
    <ToastContainer
      position="top-right"
      autoClose={1000}
      theme="colored"
      pauseOnHover
      closeOnClick
      draggable
      limit={3}
    />
  </ThemeProvider>
);
