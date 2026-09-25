/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

export default function InspectionHeader({
  t,
  headers = [],
  currentPage,
  setCurrentPage,
  handleSelectHeader,
  selectedInspectionId,
  onBatchApprove,
}) {
  // State quản lý danh sách các ID được chọn để duyệt
  const [selectedIds, setSelectedIds] = useState([]);

  // 1. LỌC CHỈ LẤY NHỮNG DÒNG CHƯA DUYỆT (pending)
  const pendingHeaders = headers.filter(
    (item) => item.approval_status === "pending",
  );

  // Phân trang trên danh sách đã lọc pending
  const itemsPerPage = 10;
  const totalPages = Math.ceil(pendingHeaders.length / itemsPerPage) || 1;
  const currentHeaders = pendingHeaders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 2. XỬ LÝ CHECKBOX CHỌN TẤT CẢ (Dành cho trang hiện tại)
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const currentPageIds = currentHeaders.map(
        (row) => row.inspection_id || row.id,
      );
      // Gộp các ID mới vào mảng selectedIds mà không bị trùng
      setSelectedIds((prev) => [...new Set([...prev, ...currentPageIds])]);
    } else {
      const currentPageIds = currentHeaders.map(
        (row) => row.inspection_id || row.id,
      );
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    }
  };

  // 3. XỬ LÝ CHECKBOX CHỌN TỪNG DÒNG
  const handleSelectRow = (event, id) => {
    event.stopPropagation(); // Tránh kích hoạt sự kiện onClick của TableRow
    if (event.target.checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // 4. XỬ LÝ GỬI YÊU CẦU DUYỆT
  const handleApproveClick = () => {
    if (selectedIds.length === 0) return;
    if (onBatchApprove) {
      onBatchApprove(selectedIds);
      setSelectedIds([]); // Reset lại checkbox sau khi duyệt
    }
  };

  const isAllCurrentSelected =
    currentHeaders.length > 0 &&
    currentHeaders.every((row) =>
      selectedIds.includes(row.inspection_id || row.id),
    );

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
        <Box sx={{ display: "flex", gap: "12px", alignItems: "center" }}>
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

          {/* NÚT DUYỆT HÀNG LOẠT (Chỉ hiển thị khi có tích chọn) */}
          {selectedIds.length > 0 && (
            <Button
              variant="contained"
              color="success"
              onClick={handleApproveClick}
              sx={{
                borderRadius: "6px",
                fontWeight: "600",
                textTransform: "none",
              }}
            >
              {t(`history.approve`)} ({selectedIds.length})
            </Button>
          )}
        </Box>

        {/* PHÂN TRANG GIAO DIỆN */}
        <Box
          style={{
            fontSize: "13px",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>{pendingHeaders.length} Chưa duyệt</span>
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
              borderBottom: "1px solid #e2e8f0",
              textAlign: "left",
            }}
          >
            {/* CỘT TÍCH CHỌN TẤT CẢ */}
            <TableCell sx={{ padding: "8px", width: "50px" }}>
              <Checkbox
                size="small"
                checked={isAllCurrentSelected}
                onChange={handleSelectAll}
              />
            </TableCell>
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
            const currentId = row.inspection_id || row.id;
            const isItemSelected = selectedIds.includes(currentId);

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
                      : isItemSelected
                        ? "#f0fdf4" // Màu nền nhẹ khi được checkbox chọn
                        : "transparent",
                  fontWeight:
                    selectedInspectionId === currentId ? "500" : "normal",
                }}
              >
                {/* CỘT CHECKBOX CHO TỪNG DÒNG */}
                <TableCell sx={{ padding: "8px" }}>
                  <Checkbox
                    size="small"
                    checked={isItemSelected}
                    onChange={(e) => handleSelectRow(e, currentId)}
                    onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click chọn dòng
                  />
                </TableCell>
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
                    "en-UK",
                  )}
                </TableCell>
                <TableCell sx={{ padding: "12px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "#b45309",
                      backgroundColor: "#fef3c7",
                      textAlign: "center",
                      minWidth: "110px",
                    }}
                  >
                    {t("history.Đang chờ duyệt")}
                  </span>
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
