/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import { useTranslation } from "react-i18next";

export default function ChecklistItem({
  checklistItems,
  handleStatusChange,
  results,
  handleTextChange,
}) {
  const { t } = useTranslation();
  return (
    <Box
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        overflow: "hidden",
      }}
    >
      <Table
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          fontSize: "14px",
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#f1f5f9",
              borderBottom: "2px solid #cbd5e1",
              color: "#1e293b",
              fontWeight: "600",
            }}
          >
            <TableCell
              style={{
                width: "10%",
                padding: "10px 4px",
                fontSize: "13px",
                fontWeight: "bold",
                color: "#64748b",
              }}
            >
              {t("report.stt")}
            </TableCell>
            <TableCell
              style={{
                width: "30%",
                padding: "10px 4px",
                fontSize: "13px",
                fontWeight: "bold",
                color: "#64748b",
              }}
            >
              {t("report.category")}
            </TableCell>
            <TableCell
              style={{
                width: "32%",
                padding: "10px 4px",
                fontSize: "13px",
                fontWeight: "bold",
                color: "#64748b",
              }}
            >
              {t("report.standard")}
            </TableCell>
            <TableCell
              style={{
                width: "28%",
                padding: "10px 4px",
                fontSize: "13px",
                fontWeight: "bold",
                color: "#64748b",
                textAlign: "center",
              }}
            >
              {t("history.result")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checklistItems.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan="4"
                style={{
                  padding: "50px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "15px",
                }}
              >
                Không tìm thấy danh sách hạng mục cần kiểm tra.
              </TableCell>
            </TableRow>
          ) : (
            checklistItems.map((item, index) => (
              <TableRow
                key={item.item_id}
                sx={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <TableCell sx={{ textAlign: "center", color: "#64748b" }}>
                  {item.display_order || index + 1}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "#1e293b",
                    wordBreak: "break-word",
                  }}
                >
                  {item.item_name}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#475569",
                    fontSize: "12px",
                    wordBreak: "break-word",
                    lineHeight: "1.4",
                  }}
                >
                  {item.standard_value}
                  {item.min_value && ` (Min: ${item.min_value}`}
                  {item.max_value && ` - Max: ${item.max_value})`}
                  {item.unit && ` [${item.unit}]`}
                </TableCell>

                <TableCell>
                  {item.item_type === "OKNG" ? (
                    <Box
                      sx={{
                        display: "inline-flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: "8px",
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      <Button
                        onClick={() => handleStatusChange(item.item_id, "OK")}
                        sx={{
                          borderRadius: "6px",
                          border: "1px solid #57b846",
                          cursor: "pointer",
                          fontWeight: "700",
                          fontSize: "13px",
                          transition: "all 0.15s",
                          width: { xs: "100%", sm: "70px" },
                          minWidth: "60px",
                          padding: "6px 12px",
                          backgroundColor:
                            results[item.item_id]?.value === "OK"
                              ? "#57b846"
                              : "#ffffff",
                          color:
                            results[item.item_id]?.value === "OK"
                              ? "#ffffff"
                              : "#57b846",
                        }}
                      >
                        OK
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(item.item_id, "NG")}
                        sx={{
                          borderRadius: "6px",
                          border: "1px solid #dc3545",
                          cursor: "pointer",
                          fontWeight: "700",
                          fontSize: "13px",
                          transition: "all 0.15s",
                          width: { xs: "100%", sm: "70px" },
                          minWidth: "60px",
                          padding: "6px 12px",
                          backgroundColor:
                            results[item.item_id]?.value === "NG"
                              ? "#dc3545"
                              : "#ffffff",
                          color:
                            results[item.item_id]?.value === "NG"
                              ? "#ffffff"
                              : "#dc3545",
                        }}
                      >
                        NG
                      </Button>
                    </Box>
                  ) : (
                    <input
                      type="text"
                      placeholder="Nhập giá trị..."
                      value={results[item.item_id]?.value || ""}
                      onChange={(e) =>
                        handleTextChange(item.item_id, e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        outline: "none",
                        fontSize: "13px",
                        color: "#334155",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
