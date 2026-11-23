/* eslint-disable react/prop-types */
import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";

export default function TableReport({ t, reportData, daysArray }) {
  // ==========================================
  // 1. XỬ LÝ GIÁ TRỊ VÀ MÀU SẮC
  // ==========================================
  const renderCellContent = (cellValue, itemType, minValue, maxValue) => {
    if (cellValue === undefined || cellValue === null || cellValue === "") {
      return {
        cellBgColor: "transparent",
        cellTextColor: "#334155",
        displayVal: "",
      };
    }

    const normalizedVal = String(cellValue).trim().replace(",", ".");

    let cellBgColor = "transparent";
    let cellTextColor = "#334155";

    if (normalizedVal.toUpperCase() === "OK") {
      cellBgColor = "#dcfce7";
      cellTextColor = "#15803d";
    } else if (["NG", "X"].includes(normalizedVal.toUpperCase())) {
      cellBgColor = "#fee2e2";
      cellTextColor = "#b91c1c";
    } else if (itemType === "NUMBER") {
      const numVal = parseFloat(normalizedVal);

      const minVal =
        minValue !== null && minValue !== undefined
          ? parseFloat(minValue)
          : null;

      const maxVal =
        maxValue !== null && maxValue !== undefined
          ? parseFloat(maxValue)
          : null;

      if (!isNaN(numVal)) {
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
    }

    return {
      cellBgColor,
      cellTextColor,
      displayVal: normalizedVal,
    };
  };

  // ==========================================
  // 2. LẤY DỮ LIỆU THEO CA
  // ==========================================
  const getShiftValue = (item, day, shiftType) => {
    if (!item || !item.days) return "";

    const dayData = item.days[day] || item.days[String(day)];

    if (!dayData) {
      // Hỗ trợ cấu trúc key dạng 1_N, 1_Đ ở cấp ngoài
      if (shiftType === "day") {
        return item.days[`${day}_N`] ?? item.days[`${day}_day`] ?? "";
      }

      return item.days[`${day}_Đ`] ?? item.days[`${day}_night`] ?? "";
    }

    // Trường hợp object
    if (typeof dayData === "object" && !Array.isArray(dayData)) {
      if (shiftType === "day") {
        return (
          dayData.day ??
          dayData["Ca ngày"] ??
          dayData.N ??
          dayData.ca_ngay ??
          ""
        );
      }

      return (
        dayData.night ?? dayData["Ca đêm"] ?? dayData.D ?? dayData.ca_dem ?? ""
      );
    }

    // Trường hợp mảng record
    if (Array.isArray(dayData)) {
      const target = dayData.find((d) =>
        shiftType === "day"
          ? ["Ca ngày", "N", "DAY"].includes(d.shift)
          : ["Ca đêm", "Đ", "NIGHT"].includes(d.shift),
      );

      return target ? (target.value ?? target.result ?? "") : "";
    }

    // Trường hợp dữ liệu dạng key riêng
    if (shiftType === "day") {
      return item.days[`${day}_N`] ?? item.days[`${day}_day`] ?? "";
    }

    return item.days[`${day}_Đ`] ?? item.days[`${day}_night`] ?? "";
  };

  // ==========================================
  // 3. CẤU HÌNH CHIỀU RỘNG CỘT
  // ==========================================
  const columnWidths = {
    stt: 55,
    category: 180,
    standard: 150,
    classify: 75,
    shift: 65,
    day: 48,
  };

  const fixedColumnsWidth =
    columnWidths.stt +
    columnWidths.category +
    columnWidths.standard +
    columnWidths.classify +
    columnWidths.shift;

  const actualTotalDays = daysArray.length;

  const totalTableWidth =
    fixedColumnsWidth + actualTotalDays * columnWidths.day;

  // ==========================================
  // 4. STYLE CHUNG
  // ==========================================
  const headerStyle = {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: "bold",
    borderRight: "1px solid #334155",
    fontSize: "11px",
    padding: "4px",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  };

  const infoCellStyle = {
    borderRight: "1px solid #e2e8f0",
    boxSizing: "border-box",
  };

  const dayCellStyle = {
    width: columnWidths.day,
    minWidth: columnWidths.day,
    maxWidth: columnWidths.day,
    padding: "2px 0",
    fontSize: "10px",
    textAlign: "center",
    borderRight: "1px solid #e2e8f0",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
  };

  // ==========================================
  // 5. GIAO DIỆN
  // ==========================================
  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
      }}
    >
      {/* Hướng dẫn cuộn trên mobile */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 1,
          color: "#64748b",
          fontSize: "12px",
        }}
      >
        Vuốt ngang để xem các ngày còn lại →
      </Box>

      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          display: "block",
          width: "100%",
          maxWidth: "100%",
          maxHeight: { xs: "70vh", md: "75vh" },
          overflowX: "auto",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",

          "&::-webkit-scrollbar": {
            width: "7px",
            height: "9px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#94a3b8",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f5f9",
          },
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            width: `${totalTableWidth}px`,
            minWidth: `${totalTableWidth}px`,
            maxWidth: `${totalTableWidth}px`,
            tableLayout: "fixed",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <colgroup>
            <col style={{ width: columnWidths.stt }} />
            <col style={{ width: columnWidths.category }} />
            <col style={{ width: columnWidths.standard }} />
            <col style={{ width: columnWidths.classify }} />
            <col style={{ width: columnWidths.shift }} />

            {daysArray.map((day) => (
              <col key={day} style={{ width: columnWidths.day }} />
            ))}
          </colgroup>

          <TableHead>
            {/* HEADER HÀNG 1 */}
            <TableRow>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  ...headerStyle,
                  width: columnWidths.stt,
                  minWidth: columnWidths.stt,
                }}
              >
                {t("report.stt")}
              </TableCell>

              <TableCell
                rowSpan={2}
                align="left"
                sx={{
                  ...headerStyle,
                  width: columnWidths.category,
                  minWidth: columnWidths.category,
                }}
              >
                {t("report.category")}
              </TableCell>

              <TableCell
                rowSpan={2}
                align="left"
                sx={{
                  ...headerStyle,
                  width: columnWidths.standard,
                  minWidth: columnWidths.standard,
                }}
              >
                {t("report.standard")}
              </TableCell>

              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  ...headerStyle,
                  width: columnWidths.classify,
                  minWidth: columnWidths.classify,
                }}
              >
                {t("report.classify")}
              </TableCell>

              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  ...headerStyle,
                  width: columnWidths.shift,
                  minWidth: columnWidths.shift,
                }}
              >
                {t("report.shift")}
              </TableCell>

              <TableCell
                colSpan={actualTotalDays}
                align="center"
                sx={{
                  ...headerStyle,
                  position: "sticky",
                  top: 0,
                  zIndex: 3,
                  width: actualTotalDays * columnWidths.day,
                  minWidth: actualTotalDays * columnWidths.day,
                }}
              >
                {t("report.day")}
              </TableCell>
            </TableRow>

            {/* HEADER HÀNG 2: NGÀY */}
            <TableRow>
              {daysArray.map((day) => (
                <TableCell
                  key={day}
                  align="center"
                  sx={{
                    position: "sticky",
                    top: 33,
                    zIndex: 2,
                    width: columnWidths.day,
                    minWidth: columnWidths.day,
                    maxWidth: columnWidths.day,
                    backgroundColor: "#334155",
                    color: "#ffffff",
                    fontWeight: "bold",
                    padding: "3px 0",
                    borderRight: "1px solid #475569",
                    fontSize: "10px",
                    boxSizing: "border-box",
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
                  colSpan={actualTotalDays + 5}
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
              reportData.map((item, index) => {
                const isEven = index % 2 === 0;
                const rowBg = isEven ? "#ffffff" : "#f8fafc";

                return (
                  <React.Fragment key={item.item_id ?? index}>
                    {/* HÀNG CA NGÀY */}
                    <TableRow
                      sx={{
                        backgroundColor: rowBg,
                        height: "28px",
                      }}
                    >
                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          ...infoCellStyle,
                          width: columnWidths.stt,
                          minWidth: columnWidths.stt,
                          backgroundColor: rowBg,
                          color: "#64748b",
                          padding: "2px",
                          fontSize: "11px",
                        }}
                      >
                        {index + 1}
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="left"
                        sx={{
                          ...infoCellStyle,
                          width: columnWidths.category,
                          minWidth: columnWidths.category,
                          backgroundColor: rowBg,
                          fontWeight: 600,
                          color: "#334155",
                          padding: "4px",
                          fontSize: "11px",
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {t(`category.${item.item_name}`)}
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="left"
                        sx={{
                          ...infoCellStyle,
                          width: columnWidths.standard,
                          minWidth: columnWidths.standard,
                          backgroundColor: rowBg,
                          color: "#475569",
                          padding: "4px",
                          fontSize: "10px",
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {t(`category_standard_value.${item.standard_value}`)}
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          ...infoCellStyle,
                          width: columnWidths.classify,
                          minWidth: columnWidths.classify,
                          backgroundColor: rowBg,
                          color: "#64748b",
                          padding: "2px",
                          fontSize: "10px",
                          whiteSpace: "normal",
                        }}
                      >
                        {item.item_type}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          ...infoCellStyle,
                          width: columnWidths.shift,
                          minWidth: columnWidths.shift,
                          backgroundColor: "#f0f9ff",
                          color: "#0284c7",
                          fontWeight: "bold",
                          fontSize: "10px",
                          padding: "2px",
                        }}
                      >
                        {t("report.ngay")}
                      </TableCell>

                      {daysArray.map((day) => {
                        const dayVal = getShiftValue(item, day, "day");

                        const style = renderCellContent(
                          dayVal,
                          item.item_type,
                          item.min_value,
                          item.max_value,
                        );

                        return (
                          <TableCell
                            key={`day-${day}`}
                            align="center"
                            sx={{
                              ...dayCellStyle,
                              backgroundColor: style.cellBgColor,
                              color: style.cellTextColor,
                              fontWeight: "bold",
                            }}
                          >
                            {style.displayVal}
                          </TableCell>
                        );
                      })}
                    </TableRow>

                    {/* HÀNG CA ĐÊM */}
                    <TableRow
                      sx={{
                        backgroundColor: rowBg,
                        height: "28px",
                        borderBottom: "2px solid #cbd5e1",
                      }}
                    >
                      <TableCell
                        align="center"
                        sx={{
                          ...infoCellStyle,
                          width: columnWidths.shift,
                          minWidth: columnWidths.shift,
                          backgroundColor: "#f8fafc",
                          color: "#475569",
                          fontWeight: "bold",
                          fontSize: "10px",
                          padding: "2px",
                        }}
                      >
                        {t("report.dem")}
                      </TableCell>

                      {daysArray.map((day) => {
                        const nightVal = getShiftValue(item, day, "night");

                        const style = renderCellContent(
                          nightVal,
                          item.item_type,
                          item.min_value,
                          item.max_value,
                        );

                        return (
                          <TableCell
                            key={`night-${day}`}
                            align="center"
                            sx={{
                              ...dayCellStyle,
                              backgroundColor: style.cellBgColor,
                              color: style.cellTextColor,
                              fontWeight: "bold",
                            }}
                          >
                            {style.displayVal}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
