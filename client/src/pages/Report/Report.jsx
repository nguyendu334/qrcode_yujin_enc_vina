import { useState, useEffect } from "react";
import XLSStyle from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";

import api from "../../helper/api";

const Report = () => {
  const { t } = useTranslation();

  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const [reportData, setReportData] = useState([]);
  const [approvers, setApprovers] = useState([]); // 🌟 State lưu danh sách người duyệt trong tháng
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await api.get("/machines");
        if (res.data) setMachines(res.data);
      } catch (error) {
        console.error("Không thể lấy danh sách máy:", error);
      }
    };
    fetchMachines();
  }, []);

  const getDaysInMonth = (yearMonthStr) => {
    if (!yearMonthStr) return 31;
    const [year, month] = yearMonthStr.split("-").map(Number);
    return new Date(year, month, 0).getDate();
  };

  const totalDays = getDaysInMonth(selectedMonth);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handleFetchReport = async () => {
    if (!selectedMachine) {
      alert("Vui lòng chọn thiết bị!");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/reports/monthly`, {
        params: { machine_id: selectedMachine, year_month: selectedMonth },
      });
      if (res.data.success) {
        processMatrixData(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const processMatrixData = (rawData) => {
    const matrix = {};
    const uniqueApprovers = new Set();

    rawData.forEach((row) => {
      if (row.approver_name) {
        uniqueApprovers.add(row.approver_name.toUpperCase());
      }

      if (!matrix[row.item_id]) {
        matrix[row.item_id] = {
          item_name: row.item_name,
          standard_value: row.standard_value,
          item_type: row.item_type,
          min_value: row.min_value,
          max_value: row.max_value,
          days: {},
        };
      }

      // 🌟 CẬP NHẬT: Ưu tiên lấy giá trị số đo (row.value) trước, nếu không có mới lấy trạng thái (row.result)
      // Dùng mã này để tránh việc số 0 bị hiểu lầm là không có dữ liệu:
      matrix[row.item_id].days[row.day_num] =
        row.value !== null && row.value !== undefined && row.value !== ""
          ? row.value
          : row.result;
    });

    setReportData(Object.values(matrix));
    setApprovers(Array.from(uniqueApprovers));
  };

  const exportToExcel = () => {
    if (reportData.length === 0) {
      alert("Không có dữ liệu để xuất file Excel!");
      return;
    }

    const currentMachineObj = machines.find(
      (m) => m.machine_id.toString() === selectedMachine.toString()
    );
    const machineNameDisplay = currentMachineObj
      ? `${currentMachineObj.machine_name} (${currentMachineObj.machine_code})`
      : "Chưa xác định";

    // 1. Khởi tạo cấu trúc mảng hàng
    const excelRows = [
      ["📊 BÁO CÁO TỔNG HỢP CHECKSHEET THEO THÁNG"],
      [],
      ["Thiết bị / Máy:", machineNameDisplay],
      ["Tháng báo cáo:", selectedMonth],
      [
        "Người phê duyệt:",
        approvers.length > 0 ? approvers.join(", ") : "Chưa có người duyệt",
      ],
      [],
    ];

    const tableHeaders = [
      "STT",
      "Hạng mục kiểm tra",
      "Tiêu chuẩn",
      "Phân loại",
      ...daysArray.map((d) => `${d}`),
    ];
    excelRows.push(tableHeaders);

    reportData.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.item_name,
        item.standard_value,
        item.item_type,
      ];
      daysArray.forEach((day) => {
        rowData.push(item.days[day] || "");
      });
      excelRows.push(rowData);
    });

    // 2. Tạo worksheet từ dữ liệu phẳng ban đầu
    const worksheet = XLSStyle.utils.aoa_to_sheet(excelRows);

    // 3. Định nghĩa các kiểu Style (Font, Color, Border, Alignment)
    const borderStyle = {
      top: { style: "thin", color: { rgb: "cbd5e1" } },
      bottom: { style: "thin", color: { rgb: "cbd5e1" } },
      left: { style: "thin", color: { rgb: "cbd5e1" } },
      right: { style: "thin", color: { rgb: "cbd5e1" } },
    };

    // Duyệt qua từng ô trong Worksheet để gắn style
    for (let cellRef in worksheet) {
      if (cellRef[0] === "!") continue; // Bỏ qua các cấu hình hệ thống của sheet

      const cell = worksheet[cellRef];
      // Lấy ra tọa độ hàng (Row) và cột (Col) dựa trên tên ô (Ví dụ: A1 -> R:0, C:0)
      const cellAddress = XLSStyle.utils.decode_cell(cellRef);
      const row = cellAddress.r;
      const col = cellAddress.c;

      // Kế thừa hoặc tạo mới object style cho ô
      cell.s = {};

      // 🌟 STYLE HÀNG 1: Tiêu đề lớn
      if (row === 0) {
        cell.s = {
          font: {
            name: "Arial",
            size: 16,
            bold: true,
            color: { rgb: "1e3a8a" },
          },
          alignment: { vertical: "center" },
        };
      }
      // 🌟 STYLE HÀNG 3, 4, 5: Thông tin hành chính
      else if (row >= 2 && row <= 4) {
        cell.s = {
          font: { name: "Arial", size: 11, bold: col === 0, italic: col === 1 },
          alignment: { vertical: "center" },
        };
      }
      // 🌟 STYLE HÀNG 6 (Index số 6): Tiêu đề của bảng dữ liệu (Table Headers)
      else if (row === 6) {
        cell.s = {
          fill: { fgColor: { rgb: "0f172a" } }, // Nền xanh đen đậm cực sang
          font: {
            name: "Arial",
            size: 10,
            bold: true,
            color: { rgb: "ffffff" },
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          border: borderStyle,
        };
      }
      // 🌟 STYLE CÁC HÀNG DỮ LIỆU CÒN LẠI (Thân bài bảng tính)
      else if (row > 6) {
        let alignmentStyle = { vertical: "center", horizontal: "center" }; // Mặc định căn giữa cho Số/OK/NG

        // Nếu là cột Tên hạng mục hoặc Tiêu chuẩn thì căn lề trái cho dễ đọc
        if (col === 1 || col === 2) {
          alignmentStyle.horizontal = "left";
        }

        cell.s = {
          font: { name: "Arial", size: 10 },
          alignment: alignmentStyle,
          border: borderStyle,
        };

        // Tự động tô màu nền đỏ nhạt cho chữ "NG" để quản lý dễ phát hiện lỗi
        if (cell.v === "NG" || cell.v === "ng" || cell.v === "X") {
          cell.s.fill = { fgColor: { rgb: "fee2e2" } };
          cell.s.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { rgb: "b91c1c" },
          };
        }
        // Tự động tô màu nền xanh nhạt cho chữ "OK"
        else if (cell.v === "OK" || cell.v === "ok") {
          cell.s.fill = { fgColor: { rgb: "dcfce7" } };
          cell.s.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { rgb: "15803d" },
          };
        }
      }
    }

    // 4. CẤU HÌNH ĐỘ RỘNG CỦA CÁC CỘT (Tránh chữ dài bị đè khuất)
    const colWidths = [
      { wch: 6 }, // STT
      { wch: 25 }, // Hạng mục kiểm tra
      { wch: 18 }, // Tiêu chuẩn
      { wch: 12 }, // Phân loại
    ];
    // Các cột ngày từ 1 đến 31 cho độ rộng nhỏ xinh vừa phải (khoảng 6 ký tự)
    daysArray.forEach(() => colWidths.push({ wch: 6 }));
    worksheet["!cols"] = colWidths;

    // 5. CẤU HÌNH GỘP Ô (Merge) cho hàng tiêu đề lớn
    worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

    // 6. CẤU HÌNH ĐỘ CAO CỦA CÁC HÀNG (Giúp bảng thoáng đãng hơn)
    worksheet["!rows"] = [
      { hpt: 30 }, // Hàng tiêu đề lớn cao 30pt
      { hpt: 15 },
      { hpt: 18 }, // Hàng thông tin hành chính cao 18pt
      { hpt: 18 },
      { hpt: 18 },
      { hpt: 15 },
      { hpt: 26 }, // Thanh tiêu đề bảng dữ liệu cao 26pt
    ];

    // 7. Xuất file
    const workbook = XLSStyle.utils.book_new();
    XLSStyle.utils.book_append_sheet(workbook, worksheet, "Báo cáo tháng");

    const fileName = `Bao_Cao_Checksheet_${selectedMonth.replace(
      "-",
      "_"
    )}.xlsx`;
    XLSStyle.writeFile(workbook, fileName);
  };

  // ========================================================
  // 🔴 HÀM XUẤT FILE PDF
  // ========================================================
  const exportToPDF = () => {
    if (reportData.length === 0) {
      alert("Không có dữ liệu để xuất file PDF!");
      return;
    }

    // Khởi tạo tài liệu PDF dáng Ngang (Landscape - 'l') vì bảng có tới 31 ngày rất rộng
    const doc = new jsPDF("l", "mm", "a3"); // Dùng khổ A3 để không bị tràn chữ

    // Cấu hình tiêu đề các cột cho PDF
    const headers = [
      [
        "STT",
        "Hạng mục kiểm tra",
        "Tiêu chuẩn",
        "Phân loại",
        ...daysArray.map((d) => d.toString()),
      ],
    ];

    // Tạo mảng dữ liệu thân bài
    const rows = reportData.map((item, index) => {
      const rowData = [
        index + 1,
        item.item_name,
        item.standard_value,
        item.item_type,
      ];
      daysArray.forEach((day) => {
        rowData.push(item.days[day] || "");
      });
      return rowData;
    });

    // Vẽ bảng tự động bằng jspdf-autotable
    doc.text(
      `BAO CAO CHECKSHEET TONG HOP THEO THANG (${selectedMonth})`,
      14,
      15
    );
    if (approvers.length > 0) {
      doc.text(`Nguoi phe duyet: ${approvers.join(", ")}`, 14, 23);
    }

    autoTable(doc, {
      startY: 28,
      head: headers,
      body: rows,
      theme: "grid",
      styles: { fontSize: 8, halign: "center" },
      columnStyles: {
        1: { halign: "left", fontStyle: "bold" }, // Cột tên hạng mục căn trái
        2: { halign: "left" }, // Cột tiêu chuẩn căn trái
      },
    });

    const fileName = `Checksheet_Thang_${selectedMonth}.pdf`;
    doc.save(fileName);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <h2
        style={{
          color: "#1e293b",
          borderBottom: "2px solid #e2e8f0",
          paddingBottom: "10px",
        }}
      >
        {t(`report.title`)}
      </h2>

      {/* BỘ LỌC TÌM KIẾM */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "flex-end",
          marginBottom: "25px",
          backgroundColor: "#f8fafc",
          padding: "15px",
          borderRadius: "6px",
        }}
      >
        {/* Các ô Select Machine và Input Month giữ nguyên như file trước của bạn */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontWeight: "bold", color: "#475569" }}>
            {t(`report.selectmachine`)}
          </label>
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: "1px solid #cbd5e1",
            }}
          >
            <option value="">-- {t(`report.selectmachine`)} --</option>
            {machines.map((m) => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.machine_code} - {m.machine_name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontWeight: "bold", color: "#475569" }}>
            {t(`report.month`)}
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: "5px 12px",
              borderRadius: "4px",
              border: "1px solid #cbd5e1",
            }}
          />
        </div>

        <button
          onClick={handleFetchReport}
          disabled={loading}
          style={{
            padding: "6px 20px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Đang tải..." : t("report.viewreport")}
        </button>

        {/* 🌟 CÁC NÚT XUẤT FILE MỚI ĐƯỢC THÊM VÀO GIỮA THANH CÔNG CỤ */}
        {reportData.length > 0 && (
          <>
            <button
              onClick={exportToExcel}
              style={{
                padding: "6px 15px",
                backgroundColor: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              📥 {t(`report.exportexcel`)}
            </button>

            <button
              onClick={exportToPDF}
              style={{
                padding: "6px 15px",
                backgroundColor: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              📄 {t(`report.exportpdf`)}
            </button>
          </>
        )}

        {approvers.length > 0 && (
          <div
            style={{
              marginLeft: "auto",
              padding: "8px 15px",
              backgroundColor: "#e2e8f0",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            <strong>{t(`report.approver`)}:</strong> {approvers.join(", ")}
          </div>
        )}
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div
        style={{
          overflowX: "auto",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          borderRadius: "8px",
        }}
      >
        <table
          border="1"
          cellPadding="6"
          cellSpacing="0"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
            fontSize: "13px",
            borderColor: "#e2e8f0",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
              <th rowSpan="2" style={{ padding: "10px" }}>
                {t(`report.stt`)}
              </th>
              <th rowSpan="2" style={{ minWidth: "180px" }}>
                {t(`report.category`)}
              </th>
              <th rowSpan="2" style={{ minWidth: "140px" }}>
                {t(`report.standard`)}
              </th>
              <th rowSpan="2" style={{ minWidth: "90px" }}>
                {t(`report.classify`)}
              </th>
              <th colSpan={totalDays} style={{ padding: "8px" }}>
                {t(`report.day`)}
              </th>
            </tr>
            <tr style={{ backgroundColor: "#334155", color: "#ffffff" }}>
              {daysArray.map((day) => (
                <th key={day} style={{ width: "32px", padding: "4px" }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.length === 0 ? (
              <tr>
                <td
                  colSpan={totalDays + 4}
                  style={{
                    padding: "30px",
                    color: "#94a3b8",
                    fontStyle: "italic",
                    backgroundColor: "#fff",
                  }}
                >
                  Không tìm thấy dữ liệu checksheet đã duyệt.
                </td>
              </tr>
            ) : (
              reportData.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                  }}
                >
                  <td style={{ padding: "8px", color: "#64748b" }}>
                    {index + 1}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#334155",
                      paddingLeft: "10px",
                    }}
                  >
                    {item.item_name}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      paddingLeft: "10px",
                      color: "#475569",
                    }}
                  >
                    {item.standard_value}
                  </td>
                  <td style={{ color: "#64748b" }}>{item.item_type}</td>

                  {daysArray.map((day) => {
                    // Tìm đến vòng lặp ngày trong <tbody> và sửa logic màu:
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

                      // 🌟 Kiểm tra nếu số đo nhỏ hơn mức tối thiểu HOẶC lớn hơn mức tối đa thì tính là NG (Lỗi)
                      if (
                        (minVal !== null && numVal < minVal) ||
                        (maxVal !== null && numVal > maxVal)
                      ) {
                        cellBgColor = "#fee2e2"; // Nền đỏ nhạt
                        cellTextColor = "#b91c1c"; // Chữ đỏ đậm
                      } else {
                        cellBgColor = "#dcfce7"; // Nếu nằm trong khoảng tiêu chuẩn thì tự động tô màu xanh OK
                        cellTextColor = "#15803d";
                      }
                    }
                    return (
                      <td
                        key={day}
                        style={{
                          backgroundColor: cellBgColor,
                          color: cellTextColor,
                          fontWeight: "bold",
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        {cellValue || ""}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Report;
