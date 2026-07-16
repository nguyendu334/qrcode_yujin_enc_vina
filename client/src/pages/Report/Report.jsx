import { useState, useEffect } from "react";
import XLSStyle from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";

import { Box, Typography } from "@mui/material";
import api from "../../helper/api";
import ReportSearch from "../../components/report/ReportSearch";
import TableReport from "../../components/report/Table";

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
    <Box sx={{ padding: 3, fontFamily: "Segoe UI, sans-serif" }}>
      {/* TIÊU ĐỀ TRANG */}
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: "bold",
          color: "#1e293b",
          borderBottom: "2px solid #e2e8f0",
          pb: 1.5,
          mb: 3,
        }}
      >
        {t(`report.title`)}
      </Typography>

      {/* BỘ LỌC TÌM KIẾM */}
      <ReportSearch
        t={t}
        selectedMachine={selectedMachine}
        setSelectedMachine={setSelectedMachine}
        machines={machines}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        handleFetchReport={handleFetchReport}
        loading={loading}
        reportData={reportData}
        exportToExcel={exportToExcel}
        exportToPDF={exportToPDF}
        approvers={approvers}
      />

      {/* BẢNG MA TRẬN DỮ LIỆU */}
      <TableReport
        t={t}
        reportData={reportData}
        daysArray={daysArray}
        totalDays={totalDays}
      />
    </Box>
  );
};

export default Report;
