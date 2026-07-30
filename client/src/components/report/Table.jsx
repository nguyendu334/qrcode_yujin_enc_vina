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
} from "@mui/material";

export default function TableReport({ t, reportData, daysArray, totalDays }) {
  // Hàm xử lý giá trị & màu sắc ô dữ liệu
  const renderCellContent = (cellValue, itemType, minValue, maxValue) => {
    if (cellValue === undefined || cellValue === null || cellValue === "") {
      return {
        cellBgColor: "transparent",
        cellTextColor: "#334155",
        displayVal: "",
      };
    }

    const valStr = String(cellValue).trim();
    let cellBgColor = "transparent";
    let cellTextColor = "#334155";

    if (valStr.toUpperCase() === "OK") {
      cellBgColor = "#dcfce7";
      cellTextColor = "#15803d";
    } else if (["NG", "X"].includes(valStr.toUpperCase())) {
      cellBgColor = "#fee2e2";
      cellTextColor = "#b91c1c";
    } else if (itemType === "NUMBER") {
      const numVal = parseFloat(cellValue);
      const minVal = minValue !== null ? parseFloat(minValue) : null;
      const maxVal = maxValue !== null ? parseFloat(maxValue) : null;

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

    return { cellBgColor, cellTextColor, displayVal: valStr };
  };

  // Hàm bóc tách dữ liệu theo Ca (Hỗ trợ nhiều kiểu cấu trúc Data)
  const getShiftValue = (item, day, shiftType) => {
    if (!item || !item.days) return "";

    const dayData = item.days[day] || item.days[String(day)];
    if (!dayData) return "";

    // Trường hợp 1: item.days[1] = { day: 'OK', night: 'NG' } hoặc { 'Ca ngày': 'OK', 'Ca đêm': 'NG' }
    if (typeof dayData === "object" && !Array.isArray(dayData)) {
      if (shiftType === "day") {
        return (
          dayData.day ??
          dayData["Ca ngày"] ??
          dayData.N ??
          dayData.ca_ngay ??
          ""
        );
      } else {
        return (
          dayData.night ??
          dayData["Ca đêm"] ??
          dayData.D ??
          dayData.ca_dem ??
          ""
        );
      }
    }

    // Trường hợp 2: item.days là mảng các record kiểm tra
    if (Array.isArray(dayData)) {
      const target = dayData.find((d) =>
        shiftType === "day"
          ? d.shift === "Ca ngày" || d.shift === "N" || d.shift === "DAY"
          : d.shift === "Ca đêm" || d.shift === "Đ" || d.shift === "NIGHT",
      );
      return target ? (target.value ?? target.result ?? "") : "";
    }

    // Trường hợp 3: Nếu dữ liệu lưu dạng key '1_N', '1_Đ' ở cấp ngoài
    if (shiftType === "day") {
      return item.days[`${day}_N`] ?? item.days[`${day}_day`] ?? "";
    } else {
      return item.days[`${day}_Đ`] ?? item.days[`${day}_night`] ?? "";
    }
  };

  return (
    <TableContainer
      component={Paper}
      elevation={3}
      sx={{
        borderRadius: 2,
        border: "1px solid #e2e8f0",
        maxHeight: "75vh",
        width: "100%",
        overflowX: "hidden", // Khóa cuộn ngang toàn bộ bảng
      }}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          width: "100%",
          tableLayout: "fixed", // Cố định layout để không bị phình chiều ngang
        }}
      >
        <TableHead>
          {/* HÀNG HEADER 1 */}
          <TableRow>
            <TableCell
              rowSpan={2}
              align="center"
              sx={{
                width: "4%",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "bold",
                borderRight: "1px solid #334155",
                padding: "2px",
                fontSize: "11px",
              }}
            >
              {t(`report.stt`)}
            </TableCell>
            <TableCell
              rowSpan={2}
              align="left"
              sx={{
                width: "16%",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "bold",
                borderRight: "1px solid #334155",
                padding: "4px 6px",
                fontSize: "11px",
              }}
            >
              {t(`report.category`)}
            </TableCell>
            <TableCell
              rowSpan={2}
              align="left"
              sx={{
                width: "14%",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "bold",
                borderRight: "1px solid #334155",
                padding: "4px 6px",
                fontSize: "11px",
              }}
            >
              {t(`report.standard`)}
            </TableCell>
            <TableCell
              rowSpan={2}
              align="center"
              sx={{
                width: "7%",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "bold",
                borderRight: "1px solid #334155",
                padding: "2px",
                fontSize: "11px",
              }}
            >
              {t(`report.classify`)}
            </TableCell>
            <TableCell
              rowSpan={2}
              align="center"
              sx={{
                width: "4%",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "bold",
                borderRight: "1px solid #334155",
                padding: "2px",
                fontSize: "11px",
              }}
            >
              Ca
            </TableCell>
            <TableCell
              colSpan={totalDays}
              align="center"
              sx={{
                width: "55%",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontWeight: "bold",
                padding: "4px",
                fontSize: "12px",
              }}
            >
              {t(`report.day`)}
            </TableCell>
          </TableRow>

          {/* HÀNG HEADER 2: Dãy số Ngày từ 1 đến 31 */}
          <TableRow>
            {daysArray.map((day) => (
              <TableCell
                key={day}
                align="center"
                sx={{
                  backgroundColor: "#334155",
                  color: "#ffffff",
                  fontWeight: "bold",
                  padding: "2px 0px",
                  borderRight: "1px solid #475569",
                  fontSize: "10px",
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
                colSpan={totalDays + 5}
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
                <React.Fragment key={index}>
                  {/* HÀNG 1: CA NGÀY */}
                  <TableRow sx={{ backgroundColor: rowBg, height: "28px" }}>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        color: "#64748b",
                        borderRight: "1px solid #e2e8f0",
                        padding: "0px",
                        fontSize: "11px",
                      }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="left"
                      sx={{
                        fontWeight: "600",
                        color: "#334155",
                        borderRight: "1px solid #e2e8f0",
                        padding: "2px 4px",
                        fontSize: "11px",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.item_name}
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="left"
                      sx={{
                        color: "#475569",
                        borderRight: "1px solid #e2e8f0",
                        padding: "2px 4px",
                        fontSize: "10px",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.standard_value}
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        color: "#64748b",
                        borderRight: "1px solid #e2e8f0",
                        padding: "0px",
                        fontSize: "10px",
                      }}
                    >
                      {item.item_type}
                    </TableCell>

                    {/* Cột nhãn 'Ngày' */}
                    <TableCell
                      align="center"
                      sx={{
                        backgroundColor: "#f0f9ff",
                        color: "#0284c7",
                        fontWeight: "bold",
                        fontSize: "10px",
                        borderRight: "1px solid #e2e8f0",
                        padding: "0px",
                      }}
                    >
                      Ngày
                    </TableCell>

                    {/* CÁC Ô GIÁ TRỊ CA NGÀY */}
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
                            backgroundColor: style.cellBgColor,
                            color: style.cellTextColor,
                            fontWeight: "bold",
                            borderRight: "1px solid #e2e8f0",
                            padding: "0px",
                            fontSize: "10px",
                          }}
                        >
                          {style.displayVal}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {/* HÀNG 2: CA ĐÊM */}
                  <TableRow
                    sx={{
                      backgroundColor: rowBg,
                      height: "28px",
                      borderBottom: "2px solid #cbd5e1",
                    }}
                  >
                    {/* Cột nhãn 'Đêm' */}
                    <TableCell
                      align="center"
                      sx={{
                        backgroundColor: "#f8fafc",
                        color: "#475569",
                        fontWeight: "bold",
                        fontSize: "10px",
                        borderRight: "1px solid #e2e8f0",
                        padding: "0px",
                      }}
                    >
                      Đêm
                    </TableCell>

                    {/* CÁC Ô GIÁ TRỊ CA ĐÊM */}
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
                            backgroundColor: style.cellBgColor,
                            color: style.cellTextColor,
                            fontWeight: "bold",
                            borderRight: "1px solid #e2e8f0",
                            padding: "0px",
                            fontSize: "10px",
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
  );
}
