import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Hoặc '0.0.0.0'
    allowedHosts: true, // Nếu Vite phiên bản mới yêu cầu chặn host lạ
  },
});
