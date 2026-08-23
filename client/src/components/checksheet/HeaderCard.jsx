/* eslint-disable react/prop-types */

import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

// import { Box, Typography, Chip } from "@mui/material";

export default function HeaderCard({
  machine,
  inspector,
  setInspector,
  currentTime,
  shift,
  setShift,
  approvers = [],
  selectedApproverId = "",
  setSelectedApproverId,
}) {
  const { t } = useTranslation();

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
          {t("history.machinecode")}:{" "}
          <span
            style={{ fontWeight: "600", color: "#475569", marginLeft: "8px" }}
          >
            {machine?.machine_code}
          </span>
        </Box>
        <Box style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
          {t("history.machinename")}:{" "}
          <span
            style={{ fontWeight: "600", color: "#475569", marginLeft: "8px" }}
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
            {t("history.approver")}:{" "}
          </label>
          <select
            value={selectedApproverId}
            onChange={(e) => setSelectedApproverId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              color: "#334155",
            }}
          >
            <option value="" disabled>
              -- Chọn {t("history.approver")} --
            </option>
            {approvers && approvers.length > 0 ? (
              approvers.map((app) => (
                <option key={app.user_id} value={app.user_id}>
                  {app.full_name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {t("machinemenu.no_approver_found")}{" "}
                {/* "Không tìm thấy người duyệt" */}
              </option>
            )}
          </select>
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
            {t("history.inspector")}
          </label>
          <input
            type="text"
            value={inspector}
            onChange={(e) => setInspector(e.target.value)}
            placeholder={t("machinemenu.typing")}
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
            {t("history.date")}
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
            {t("history.shift")}
          </label>
          <input
            disabled
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
            {/* <option value="">{t("history.selectshift")}</option>
            <option value="Ca ngày">{t("shift.Ca ngày")}</option>
            <option value="Ca đêm">{t("shift.Ca đêm")}</option> */}
          </input>
        </Box>
      </Box>
    </Box>
  );
}
