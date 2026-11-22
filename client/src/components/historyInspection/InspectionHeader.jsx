/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  const [selectedIds, setSelectedIds] = useState([]);

  // Chỉ lấy những dòng chưa duyệt
  const pendingHeaders = headers.filter(
    (item) => item.approval_status === "pending"
  );

  // Phân trang
  const itemsPerPage = 10;
  const totalPages = Math.ceil(pendingHeaders.length / itemsPerPage) || 1;

  const currentHeaders = pendingHeaders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Chọn tất cả trong trang hiện tại
  const handleSelectAll = (event) => {
    const currentPageIds = currentHeaders.map(
      (row) => row.inspection_id || row.id
    );

    if (event.target.checked) {
      setSelectedIds((prev) => [...new Set([...prev, ...currentPageIds])]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    }
  };

  // Chọn từng dòng
  const handleSelectRow = (event, id) => {
    event.stopPropagation();

    if (event.target.checked) {
      setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Duyệt hàng loạt
  const handleApproveClick = () => {
    if (selectedIds.length === 0) return;

    if (onBatchApprove) {
      onBatchApprove(selectedIds);
      setSelectedIds([]);
    }
  };

  const isAllCurrentSelected =
    currentHeaders.length > 0 &&
    currentHeaders.every((row) =>
      selectedIds.includes(row.inspection_id || row.id)
    );

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
      {/* Thanh công cụ */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", lg: "center" },
          gap: 2,
          mb: 2,
        }}
      >
        {/* Tìm kiếm và các nút chức năng */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
            width: { xs: "100%", lg: "auto" },
          }}
        >
          <Box
            component="input"
            type="text"
            placeholder={t("search")}
            sx={{
              width: { xs: "100%", sm: "220px" },
              minWidth: 0,
              boxSizing: "border-box",
              padding: "9px 12px",
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              outline: "none",
              fontSize: "14px",
            }}
          />

          <Button
            variant="outlined"
            sx={{
              borderColor: "#e2e8f0",
              color: "#64748b",
              borderRadius: 2,
              textTransform: "none",
              whiteSpace: "nowrap",
              px: 2,
            }}
          >
            📥 Download
          </Button>

          {selectedIds.length > 0 && (
            <Button
              variant="contained"
              color="success"
              onClick={handleApproveClick}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
            >
              {t("history.approve")} ({selectedIds.length})
            </Button>
          )}
        </Box>

        {/* Phân trang */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: { xs: "space-between", lg: "flex-end" },
            gap: 1,
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          <Box sx={{ whiteSpace: "nowrap" }}>
            {pendingHeaders.length} Chưa duyệt
          </Box>

          <Button
            size="small"
            variant="outlined"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            sx={{
              minWidth: 36,
              px: 1,
              borderColor: "#e2e8f0",
              color: "#64748b",
            }}
          >
            &lt;
          </Button>

          <Box sx={{ whiteSpace: "nowrap" }}>
            Page <b>{currentPage}</b> of {totalPages}
          </Box>

          <Button
            size="small"
            variant="outlined"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            sx={{
              minWidth: 36,
              px: 1,
              borderColor: "#e2e8f0",
              color: "#64748b",
            }}
          >
            &gt;
          </Button>
        </Box>
      </Box>

      {/* Bảng dữ liệu */}
      <TableContainer
        component={Paper}
        elevation={0}
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
            minWidth: 1000,
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
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={isAllCurrentSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>

              <TableCell>{t("history.machinecode")}</TableCell>
              <TableCell>{t("history.machinename")}</TableCell>
              <TableCell>{t("history.inspector")}</TableCell>
              <TableCell>{t("history.shift")}</TableCell>
              <TableCell>{t("history.date")}</TableCell>
              <TableCell>{t("user.status")}</TableCell>
              <TableCell>{t("history.approver")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {currentHeaders.length > 0 ? (
              currentHeaders.map((row) => {
                const currentId = row.inspection_id || row.id;
                const isItemSelected = selectedIds.includes(currentId);

                return (
                  <TableRow
                    key={currentId}
                    hover
                    onClick={() => handleSelectHeader(currentId)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor:
                        selectedInspectionId === currentId
                          ? "#e0e7ff"
                          : isItemSelected
                          ? "#f0fdf4"
                          : "transparent",
                      "& td": {
                        whiteSpace: "nowrap",
                        py: 1.5,
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={isItemSelected}
                        onChange={(e) => handleSelectRow(e, currentId)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>

                    <TableCell>{row.machineCode}</TableCell>
                    <TableCell>{row.machineName}</TableCell>
                    <TableCell>{row.inspector}</TableCell>
                    <TableCell>{t(`shift.${row.shift}`)}</TableCell>

                    <TableCell>
                      {new Date(row.date || row.inspection_date).toLocaleString(
                        "en-UK"
                      )}
                    </TableCell>

                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          display: "inline-block",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1.5,
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "#b45309",
                          backgroundColor: "#fef3c7",
                          textAlign: "center",
                          minWidth: 110,
                        }}
                      >
                        {t("history.Đang chờ duyệt")}
                      </Box>
                    </TableCell>

                    <TableCell>{row.approver_name}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  {t("history.noData") || "Không có dữ liệu"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
