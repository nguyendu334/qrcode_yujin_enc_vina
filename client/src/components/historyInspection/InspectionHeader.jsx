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

export default function InspectionHeader({
  t,
  headers,
  currentPage,
  setCurrentPage,
  totalPages,
  currentHeaders,
  handleSelectHeader,
  selectedInspectionId,
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            placeholder={t(`search`)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
            }}
          />
          <Button
            sx={{
              background: "none",
              border: "1px solid #e2e8f0",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            📥 Download
          </Button>
        </Box>

        {/* PHÂN TRANG GIAO DIỆN THEO ĐÚNG THIẾT KẾ */}
        <Box
          style={{
            fontSize: "13px",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>{headers.length} Records</span>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            style={{
              border: "1px solid #e2e8f0",
              background: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            &lt;
          </button>
          <span>
            Page <b>{currentPage}</b> of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            style={{
              border: "1px solid #e2e8f0",
              background: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            &gt;
          </button>
        </Box>
      </Box>

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
              {t(`history.machinecode`)}
            </TableCell>
            <TableCell sx={{ padding: "12px" }}>
              {t(`history.machinename`)}
            </TableCell>
            <TableCell sx={{ padding: "12px" }}>
              {t(`history.inspector`)}
            </TableCell>
            <TableCell sx={{ padding: "12px" }}>{t(`history.shift`)}</TableCell>
            <TableCell sx={{ padding: "12px" }}>{t(`history.date`)}</TableCell>
            <TableCell sx={{ padding: "12px" }}>{t(`user.status`)}</TableCell>
            <TableCell sx={{ padding: "12px" }}>
              {t(`history.approver`)}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentHeaders.map((row) => {
            // Lấy trường ID linh hoạt theo dữ liệu trả về từ API Backend của bạn
            const currentId = row.inspection_id || row.id;

            return (
              <TableRow
                key={currentId}
                onClick={() => handleSelectHeader(currentId)}
                sx={{
                  borderBottom: "1px solid #f1f5f9",
                  cursor: "pointer",
                  backgroundColor:
                    selectedInspectionId === currentId
                      ? "#e0e7ff"
                      : "transparent",
                  fontWeight:
                    selectedInspectionId === currentId ? "500" : "normal",
                }}
              >
                <TableCell sx={{ padding: "12px" }}>
                  {row.machineCode}
                </TableCell>
                <TableCell sx={{ padding: "12px" }}>
                  {row.machineName}
                </TableCell>
                <TableCell sx={{ padding: "12px" }}>{row.inspector}</TableCell>
                <TableCell sx={{ padding: "12px" }}>
                  {t(`shift.${row.shift}`)}
                </TableCell>
                <TableCell sx={{ padding: "12px" }}>
                  {new Date(row.date || row.inspection_date).toLocaleString(
                    "en-UK"
                  )}
                </TableCell>
                <TableCell sx={{ padding: "12px" }}>
                  {(() => {
                    // 1. Định nghĩa bộ màu sắc và text tương ứng với từng trạng thái
                    const statusConfig = {
                      pending: {
                        text: "history.Đang chờ duyệt",
                        color: "#b45309",
                        bgColor: "#fef3c7",
                      }, // Vàng Cam
                      approved: {
                        text: "history.Đã duyệt",
                        color: "#15803d",
                        bgColor: "#dcfce7",
                      }, // Xanh lá
                      rejected: {
                        text: "history.Từ chối",
                        color: "#b91c1c",
                        bgColor: "#fee2e2",
                      }, // Đỏ
                    };

                    // 2. Lấy cấu hình hiện tại dựa vào row.approval_status
                    const currentStatus = statusConfig[row.approval_status] || {
                      text: "Không có thông tin",
                      color: "#64748b",
                      bgColor: "#f1f5f9",
                    };

                    // 3. Trả về thẻ span đã được custom CSS đẹp mắt
                    return (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          color: currentStatus.color,
                          backgroundColor: currentStatus.bgColor,
                          textAlign: "center",
                          minWidth: "110px",
                        }}
                      >
                        {t(currentStatus.text)}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell sx={{ padding: "12px" }}>
                  {row.approver_name}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
