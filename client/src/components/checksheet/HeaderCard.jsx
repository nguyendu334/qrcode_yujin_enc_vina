/* eslint-disable react/prop-types */

import { Box } from "@mui/material";

// import { Box, Typography, Chip } from "@mui/material";

export default function HeaderCard({
  machine,
  inspector,
  setInspector,
  currentTime,
  shift,
  setShift,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "35px",
        gap: "40px",
        flexWrap: "wrap",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          paddingTop: "10px",
        }}
      >
        <Box style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
          Mã máy:{" "}
          <span
            style={{ fontWeight: "500", color: "#475569", marginLeft: "8px" }}
          >
            {machine?.machine_code}
          </span>
        </Box>
        <Box style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
          Tên máy:{" "}
          <span
            style={{ fontWeight: "500", color: "#475569", marginLeft: "8px" }}
          >
            {machine?.machine_name}
          </span>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Box>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            Người phê duyệt phiếu:
          </label>
          <input
            type="text"
            // Hiển thị tên người duyệt lấy từ DB, nếu trống thì báo Chưa cấu hình
            value={machine?.approver_name || "Chưa cấu hình người duyệt"}
            disabled // 👈 Thuộc tính khóa ô này lại, công nhân không thể sửa bằng tay
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f1f5f9", // Đổi nền xám để nhận biết ô bị khóa
              color: "#475569",
              fontWeight: "bold",
            }}
          />
        </Box>
        <Box>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "6px",
            }}
          >
            Người kiểm tra
          </label>
          <input
            type="text"
            value={inspector}
            onChange={(e) => setInspector(e.target.value)}
            placeholder="Nhập tên người kiểm tra"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </Box>

        <Box>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "6px",
            }}
          >
            Ngày kiểm tra
          </label>
          <input
            type="text"
            value={new Date(currentTime).toLocaleString("en-UK")}
            disabled
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f1f5f9",
              color: "#64748b",
              fontSize: "14px",
              boxSizing: "border-box",
              cursor: "not-allowed",
            }}
          />
        </Box>

        <Box>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "6px",
            }}
          >
            Ca
          </label>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "#fff",
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          >
            <option value="">Chọn ca</option>
            <option value="Ca ngày">Ca ngày (Day Shift)</option>
            <option value="Ca đêm">Ca đêm (Night Shift)</option>
          </select>
        </Box>
      </Box>
    </Box>
  );
}
