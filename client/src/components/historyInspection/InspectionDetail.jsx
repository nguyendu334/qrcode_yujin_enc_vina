/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
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
  const status = details[0]?.approval_status;

  const statusBackground =
    status === "pending"
      ? "#fffbeb"
      : status === "approved"
      ? "#f0fdf4"
      : status === "rejected"
      ? "#fef2f2"
      : "#f8fafc";

  const statusBorder =
    status === "pending"
      ? "#fef3c7"
      : status === "approved"
      ? "#dcfce7"
      : status === "rejected"
      ? "#fee2e2"
      : "#e2e8f0";

  const statusColor =
    status === "pending"
      ? "#d97706"
      : status === "approved"
      ? "#16a34a"
      : status === "rejected"
      ? "#dc2626"
      : "#475569";

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        backgroundColor: "background.paper",
        p: { xs: 1.5, sm: 2, md: 2.5 },
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Trạng thái phê duyệt */}
      {details.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1,
            mb: 2,
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            backgroundColor: statusBackground,
            border: `1px solid ${statusBorder}`,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              color: "#334155",
              fontSize: "14px",
            }}
          >
            {t("history.status")}
          </Typography>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "14px",
              color: statusColor,
              overflowWrap: "anywhere",
            }}
          >
            {status === "pending" && (
              <>
                ⏳ {t("history.waiting")}{" "}
                <strong>
                  {details[0]?.approver_name?.toUpperCase() || "QUẢN LÝ"}
                </strong>{" "}
                {t("history.approval")}
              </>
            )}

            {status === "approved" && (
              <>
                ✅ {t("history.approvedby")}{" "}
                <strong>{details[0]?.approver_name?.toUpperCase()}</strong>
              </>
            )}

            {status === "rejected" && (
              <>
                ❌ {t("history.rejectedby")}{" "}
                <strong>{details[0]?.approver_name?.toUpperCase()}</strong>
              </>
            )}

            {!status && "Chưa có thông tin"}
          </Typography>
        </Box>
      )}

      {/* Bảng chi tiết */}
      <TableContainer
        sx={{
          width: "100%",
          overflowX: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: 2,
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 750,
            borderCollapse: "collapse",
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#f8fafc",
                "& th": {
                  fontWeight: 700,
                  color: "#475569",
                  whiteSpace: "nowrap",
                  py: 1.5,
                },
              }}
            >
              <TableCell>{t("history.category")}</TableCell>
              <TableCell>{t("history.standard")}</TableCell>
              <TableCell>{t("history.result")}</TableCell>
              <TableCell>{t("history.value")}</TableCell>
              <TableCell>{t("history.remark")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {details.length > 0 ? (
              details.map((item) => {
                const itemId = item.detail_id || item.id;

                return (
                  <TableRow
                    key={itemId}
                    sx={{
                      borderBottom: "1px solid #f1f5f9",
                      "& td": {
                        py: 1.5,
                      },
                    }}
                  >
                    <TableCell>{t(`category.${item.item}`) || "N/A"}</TableCell>

                    <TableCell sx={{ color: "#64748b" }}>
                      {t(`category_standard_value.${item.standard}`) || "--"}
                    </TableCell>

                    <TableCell>
                      {item.result && item.result.trim() !== "" && (
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            backgroundColor:
                              item.result === "OK" ? "#ecfdf5" : "#fef2f2",
                            color: item.result === "OK" ? "#10b981" : "#ef4444",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 600,
                          }}
                        >
                          {item.result}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>{item.value}</TableCell>

                    <TableCell
                      sx={{
                        color: "#94a3b8",
                        minWidth: 150,
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.remark || "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{
                    py: 4,
                    color: "#94a3b8",
                    whiteSpace: "normal",
                  }}
                >
                  Bấm chọn vào một dòng ở danh sách phía trên để xem chi tiết
                  hạng mục kiểm tra.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Khu vực duyệt / từ chối */}
      {details.length > 0 &&
        status === "pending" &&
        currentUser.user_id === currentApproverId && (
          <Box
            sx={{
              mt: 2.5,
              pt: 2.5,
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Ghi chú */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                width: "100%",
              }}
            >
              <Typography
                component="label"
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                {t("history.remarkApp")}
              </Typography>

              <Box
                component="textarea"
                placeholder={t("history.typing")}
                onChange={(e) => setApprovalComment(e.target.value)}
                sx={{
                  width: "100%",
                  boxSizing: "border-box",
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  minHeight: 80,
                  outline: "none",
                  "&:focus": {
                    borderColor: "#6366f1",
                  },
                }}
              />
            </Box>

            {/* Hai nút hành động */}
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "stretch", sm: "flex-end" },
                flexDirection: { xs: "column", sm: "row" },
                gap: 1.5,
                width: "100%",
              }}
            >
              <Button
                onClick={() => {
                  if (
                    window.confirm(
                      "Bạn có chắc chắn muốn TỪ CHỐI phiếu kiểm tra này?"
                    )
                  ) {
                    handleApproveAction("rejected");
                  }
                }}
                sx={{
                  width: { xs: "100%", sm: "150px" },
                  py: 1.1,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  color: "#dc2626",
                  border: "1px solid #dc2626",
                  fontWeight: 600,
                  fontSize: "14px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#fee2e2",
                  },
                }}
              >
                {t("history.reject")}
              </Button>

              <Button
                onClick={() => {
                  if (
                    window.confirm("Xác nhận PHÊ DUYỆT phiếu kiểm tra này?")
                  ) {
                    handleApproveAction("approved");
                  }
                }}
                sx={{
                  width: { xs: "100%", sm: "150px" },
                  py: 1.1,
                  borderRadius: 2,
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "14px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#15803d",
                  },
                }}
              >
                {t("history.approve")}
              </Button>
            </Box>
          </Box>
        )}
    </Box>
  );
}
