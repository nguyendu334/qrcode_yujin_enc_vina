/* eslint-disable react/prop-types */
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function TableReport({ t, reportData, daysArray, totalDays }) {
  return (
    <TableContainer
      component={Paper}
      elevation={3}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        maxHeight: "70vh", // Giới hạn chiều cao để scroll nội bộ bảng nếu bảng quá dài
      }}
    >
      <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          {/* Hàng Header 1 */}
          <TableRow>
            <TableCell
              rowSpan={2}
              align="center"
              sx={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "bold",
                borderRight: "1px solid #334155",
                zIndex: 3, // Giữ vị trí cố định khi cuộn
              }}
            >
              {t(`report.stt`)}
            </TableCell>
            <TableCell
              rowSpan={2}
              align="left"
              sx={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "bold",
                minWidth: 180,
                borderRight: "1px solid #334155",
                zIndex: 3,
              }}
            >
              {t(`report.category`)}
            </TableCell>
            <TableCell
              rowSpan={2}
              align="left"
              sx={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "bold",
                minWidth: 140,
                borderRight: "1px solid #334155",
                zIndex: 3,
              }}
            >
              {t(`report.standard`)}
            </TableCell>
            <TableCell
              rowSpan={2}
              align="center"
              sx={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "bold",
                minWidth: 90,
                borderRight: "1px solid #334155",
                zIndex: 3,
              }}
            >
              {t(`report.classify`)}
            </TableCell>
            <TableCell
              colSpan={totalDays}
              align="center"
              sx={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "bold",
                padding: "8px",
              }}
            >
              {t(`report.day`)}
            </TableCell>
          </TableRow>

          {/* Hàng Header 2 (Các cột số ngày) */}
          <TableRow>
            {daysArray.map((day) => (
              <TableCell
                key={day}
                align="center"
                sx={{
                  backgroundColor: "#334155",
                  color: "#ffffff",
                  fontWeight: "bold",
                  width: "32px",
                  padding: "4px",
                  borderRight: "1px solid #475569",
                }}
              >
                {day}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {reportData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={totalDays + 4}
                align="center"
                sx={{
                  padding: 4,
                  color: "#94a3b8",
                  fontStyle: "italic",
                  backgroundColor: "#ffffff",
                }}
              >
                Không tìm thấy dữ liệu checksheet đã duyệt.
              </TableCell>
            </TableRow>
          ) : (
            reportData.map((item, index) => (
              <TableRow
                key={index}
                sx={{
                  height: "48px",
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                  "&:hover": { backgroundColor: "#f1f5f9" }, // Hiệu ứng hover dòng chuyên nghiệp của MUI
                }}
              >
                {/* Cột STT */}
                <TableCell
                  align="center"
                  sx={{ color: "#64748b", borderRight: "1px solid #e2e8f0" }}
                >
                  {index + 1}
                </TableCell>

                {/* Cột Tên hạng mục */}
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: "600",
                    color: "#334155",
                    borderRight: "1px solid #e2e8f0",
                  }}
                >
                  {item.item_name}
                </TableCell>

                {/* Cột Tiêu chuẩn */}
                <TableCell
                  align="left"
                  sx={{ color: "#475569", borderRight: "1px solid #e2e8f0" }}
                >
                  {item.standard_value}
                </TableCell>

                {/* Cột Phân loại */}
                <TableCell
                  align="center"
                  sx={{ color: "#64748b", borderRight: "1px solid #e2e8f0" }}
                >
                  {item.item_type}
                </TableCell>

                {/* Vòng lặp các ô kết quả kiểm tra từng ngày */}
                {daysArray.map((day) => {
                  const cellValue = item.days[day];
                  let cellBgColor = "transparent";
                  let cellTextColor = "#334155";

                  if (cellValue === "OK" || cellValue === "ok") {
                    cellBgColor = "#dcfce7";
                    cellTextColor = "#15803d";
                  } else if (
                    cellValue === "NG" ||
                    cellValue === "ng" ||
                    cellValue === "X" ||
                    cellValue === "x"
                  ) {
                    cellBgColor = "#fee2e2";
                    cellTextColor = "#b91c1c";
                  } else if (
                    item.item_type === "NUMBER" &&
                    cellValue !== undefined &&
                    cellValue !== null &&
                    cellValue !== ""
                  ) {
                    const numVal = parseFloat(cellValue);
                    const minVal =
                      item.min_value !== null
                        ? parseFloat(item.min_value)
                        : null;
                    const maxVal =
                      item.max_value !== null
                        ? parseFloat(item.max_value)
                        : null;

                    if (
                      (minVal !== null && numVal < minVal) ||
                      (maxVal !== null && numVal > maxVal)
                    ) {
                      cellBgColor = "#fee2e2";
                      cellTextColor = "#b91c1c";
                    } else {
                      cellBgColor = "#dcfce7";
                      cellTextColor = "#15803d";
                    }
                  }

                  return (
                    <TableCell
                      key={day}
                      align="center"
                      sx={{
                        backgroundColor: cellBgColor,
                        color: cellTextColor,
                        fontWeight: "bold",
                        borderRight: "1px solid #e2e8f0",
                        padding: "4px",
                      }}
                    >
                      {cellValue || ""}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
