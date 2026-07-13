/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export default function InspectionDetail({
  t,
  details,
  currentUser,
  currentApproverId,
  setApprovalComment,
  handleApproveAction,
}) {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {details.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            padding: "8px 16px",
            borderRadius: "8px",
            // Tự động đổi màu nền nhẹ toàn khu vực theo trạng thái của phiếu
            backgroundColor:
              details[0]?.approval_status === "pending"
                ? "#fffbeb"
                : details[0]?.approval_status === "approved"
                ? "#f0fdf4"
                : details[0]?.approval_status === "rejected"
                ? "#fef2f2"
                : "#f8fafc",
            border: `1px solid ${
              details[0]?.approval_status === "pending"
                ? "#fef3c7"
                : details[0]?.approval_status === "approved"
                ? "#dcfce7"
                : details[0]?.approval_status === "rejected"
                ? "#fee2e2"
                : "#e2e8f0"
            }`,
          }}
        >
          <Typography
            sx={{ fontWeight: "600", color: "#334155", fontSize: "14px" }}
          >
            {t(`history.status`)}
          </Typography>

          {/* Badge trạng thái chữ đậm */}
          <Typography
            sx={{
              fontWeight: "700",
              fontSize: "14px",
              color:
                details[0]?.approval_status === "pending"
                  ? "#d97706"
                  : details[0]?.approval_status === "approved"
                  ? "#16a34a"
                  : details[0]?.approval_status === "rejected"
                  ? "#dc2626"
                  : "#475569",
            }}
          >
            {details[0]?.approval_status === "pending" && (
              <span>
                ⏳ {t(`history.waiting`)}{" "}
                <strong style={{ color: "#d97706" }}>
                  {details[0]?.approver_name?.toUpperCase() || "QUẢN LÝ"}
                </strong>{" "}
                {t(`history.approval`)}
              </span>
            )}

            {details[0]?.approval_status === "approved" && (
              <span>
                ✅ {t(`history.approvedby`)}{" "}
                <strong style={{ color: "#16a34a" }}>
                  {details[0]?.approver_name?.toUpperCase()}
                </strong>
              </span>
            )}

            {details[0]?.approval_status === "rejected" && (
              <span>
                ❌ {t(`history.rejectedby`)}{" "}
                <strong style={{ color: "#dc2626" }}>
                  {details[0]?.approver_name?.toUpperCase()}
                </strong>
              </span>
            )}
            {!details[0]?.approval_status && "Chưa có thông tin"}
          </Typography>
        </Box>
      )}
      <Table
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "14px",
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "",
              borderBottom: "1px solid #e2e8f0",
              textAlign: "left",
            }}
          >
            <TableCell sx={{ padding: "12px" }}>
              {t(`history.category`)}
            </TableCell>
            <TableCell sx={{ padding: "12px" }}>
              {t(`history.standard`)}
            </TableCell>
            <TableCell sx={{ padding: "12px" }}>
              {t(`history.result`)}
            </TableCell>
            <TableCell sx={{ padding: "12px" }}>{t(`history.value`)}</TableCell>
            <TableCell sx={{ padding: "12px" }}>
              {t(`history.remark`)}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {details.length > 0 ? (
            details.map((item) => {
              const itemId = item.detail_id || item.id;
              return (
                <TableRow
                  key={itemId}
                  sx={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <TableCell sx={{ padding: "12px" }}>
                    {item.item || "N/A"}
                  </TableCell>
                  <TableCell sx={{ padding: "12px", color: "#64748b" }}>
                    {item.standard || "—"}
                  </TableCell>
                  <TableCell sx={{ padding: "12px" }}>
                    {item.result && item.result.trim() !== "" ? (
                      <span
                        style={{
                          backgroundColor:
                            item.result === "OK" ? "#ecfdf5" : "#fef2f2",
                          color: item.result === "OK" ? "#10b981" : "#ef4444",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        {item.result}
                      </span>
                    ) : (
                      <span></span>
                    )}
                  </TableCell>
                  <TableCell sx={{ padding: "12px" }}>{item.value}</TableCell>
                  <TableCell sx={{ padding: "12px", color: "#94a3b8" }}>
                    {item.remark || "—"}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan="5"
                sx={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                Bấm chọn vào một dòng ở danh sách phía trên để xem chi tiết hạng
                mục kiểm tra.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/*HIỂN THỊ NÚT DUYỆT / TỪ CHỐI KHI PHIẾU Ở TRẠNG THÁI CHỜ DUYỆT */}
      {/* currentUser.role === "manager" ||
      currentUser.role === "admin" || */}
      {details.length >= 0 &&
        details[0]?.approval_status === "pending" &&
        (
          currentUser.user_id === currentApproverId) && (
          <Box
            style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Ô nhập ghi chú phê duyệt hoặc lý do từ chối (Tùy chọn) */}
            <Box
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                }}
              >
                {t(`history.remarkApp`)}
              </label>
              <textarea
                placeholder={t(`history.typing`)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  minHeight: "60px",
                }}
                onChange={(e) => setApprovalComment(e.target.value)} // Bật ra nếu bạn dùng state lưu comment
              />
            </Box>

            {/* Vùng chứa 2 nút bấm hành động */}
            <Box
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <Button
                onClick={() => {
                  if (
                    window.confirm(
                      "Bạn có chắc chắn muốn TỪ CHỐI phiếu kiểm tra này?"
                    )
                  ) {
                    // Gọi API cập nhật trạng thái thành 'rejected'
                    handleApproveAction("rejected");
                  }
                }}
                sx={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  color: "#dc2626",
                  border: "1px solid #dc2626",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F6BFB1")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fff")
                }
              >
                {t(`history.reject`)}
              </Button>

              <Button
                onClick={() => {
                  if (
                    window.confirm("Xác nhận PHÊ DUYỆT phiếu kiểm tra này?")
                  ) {
                    // Gọi API cập nhật trạng thái thành 'approved'
                    handleApproveAction("approved");
                  }
                }}
                sx={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#15803d")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#16a34a")
                }
              >
                {t(`history.approve`)}
              </Button>
            </Box>
          </Box>
        )}
    </Box>
  );
}
