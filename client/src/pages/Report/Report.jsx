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
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [reportData, setReportData] = useState([]);
  const [approvers, setApprovers] = useState([]);
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
        // Nếu Backend chưa gom nhóm sẵn, gọi hàm processMatrixData bên dưới
        processMatrixData(res.data.data);
        console.log(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 HÀM XỬ LÝ DỮ LIỆU CHUẨN DẠNG 2 CA (NGÀY / ĐÊM)
  const processMatrixData = (rawData) => {
    // Nếu Backend đã nhóm sẵn dạng Array các item có chứa object 'days', dùng trực tiếp
    if (
      rawData.length > 0 &&
      rawData[0].item_id &&
      typeof rawData[0].days === "object"
    ) {
      const uniqueApprovers = new Set();
      rawData.forEach((row) => {
        if (row.approver_name)
          uniqueApprovers.add(row.approver_name.toUpperCase());
      });
      setReportData(rawData);
      setApprovers(Array.from(uniqueApprovers));
      return;
    }

    // Nếu Backend trả về mảng phẳng các bản ghi (Flat Array)
    const matrix = {};
    const uniqueApprovers = new Set();

    rawData.forEach((row) => {
      if (row.approver_name) {
        uniqueApprovers.add(row.approver_name.toUpperCase());
      }

      if (!matrix[row.item_id]) {
        matrix[row.item_id] = {
          item_id: row.item_id,
          item_name: row.item_name,
          standard_value: row.standard_value,
          item_type: row.item_type,
          min_value: row.min_value,
          max_value: row.max_value,
          days: {},
        };
      }

      const day = row.day_num;
      if (!matrix[row.item_id].days[day]) {
        matrix[row.item_id].days[day] = {};
      }

      const val =
        row.value !== null && row.value !== undefined && row.value !== ""
          ? row.value
          : row.result;

      // Phân tách giá trị cho Ca Ngày & Ca Đêm
      const shiftStr = String(row.shift || "").toLowerCase();
      if (
        shiftStr.includes("ngày") ||
        shiftStr.includes("day") ||
        shiftStr === "n"
      ) {
        matrix[row.item_id].days[day].day = val;
      } else {
        matrix[row.item_id].days[day].night = val;
      }
    });

    setReportData(Object.values(matrix));
    setApprovers(Array.from(uniqueApprovers));
  };

  // ========================================================
  // 🟢 HÀM XUẤT FILE EXCEL (XUẤT ĐỦ 2 HÀNG / HẠNG MỤC)
  // ========================================================
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
      "Ca",
      ...daysArray.map((d) => `${d}`),
    ];
    excelRows.push(tableHeaders);

    reportData.forEach((item, index) => {
      // HÀNG CA NGÀY
      const dayRow = [
        index + 1,
        item.item_name,
        item.standard_value,
        item.item_type,
        "Ngày",
      ];
      // HÀNG CA ĐÊM
      const nightRow = ["", "", "", "", "Đêm"];

      daysArray.forEach((day) => {
        const dayVal = item.days?.[day]?.day ?? item.days?.[`${day}_N`] ?? "";
        const nightVal =
          item.days?.[day]?.night ?? item.days?.[`${day}_Đ`] ?? "";
        dayRow.push(dayVal);
        nightRow.push(nightVal);
      });

      excelRows.push(dayRow);
      excelRows.push(nightRow);
    });

    const worksheet = XLSStyle.utils.aoa_to_sheet(excelRows);

    const borderStyle = {
      top: { style: "thin", color: { rgb: "cbd5e1" } },
      bottom: { style: "thin", color: { rgb: "cbd5e1" } },
      left: { style: "thin", color: { rgb: "cbd5e1" } },
      right: { style: "thin", color: { rgb: "cbd5e1" } },
    };

    // Format style cho ô
    for (let cellRef in worksheet) {
      if (cellRef[0] === "!") continue;

      const cell = worksheet[cellRef];
      const cellAddress = XLSStyle.utils.decode_cell(cellRef);
      const row = cellAddress.r;
      const col = cellAddress.c;

      cell.s = {};

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
      } else if (row >= 2 && row <= 4) {
        cell.s = {
          font: { name: "Arial", size: 11, bold: col === 0, italic: col === 1 },
          alignment: { vertical: "center" },
        };
      } else if (row === 6) {
        cell.s = {
          fill: { fgColor: { rgb: "0f172a" } },
          font: {
            name: "Arial",
            size: 10,
            bold: true,
            color: { rgb: "ffffff" },
          },
          alignment: { horizontal: "center", vertical: "center" },
          border: borderStyle,
        };
      } else if (row > 6) {
        let alignmentStyle = { vertical: "center", horizontal: "center" };
        if (col === 1 || col === 2) alignmentStyle.horizontal = "left";

        cell.s = {
          font: { name: "Arial", size: 10 },
          alignment: alignmentStyle,
          border: borderStyle,
        };

        if (cell.v === "NG" || cell.v === "X") {
          cell.s.fill = { fgColor: { rgb: "fee2e2" } };
          cell.s.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { rgb: "b91c1c" },
          };
        } else if (cell.v === "OK") {
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

    const colWidths = [
      { wch: 6 },
      { wch: 25 },
      { wch: 18 },
      { wch: 10 },
      { wch: 8 },
    ];
    daysArray.forEach(() => colWidths.push({ wch: 5 }));
    worksheet["!cols"] = colWidths;

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

    const doc = new jsPDF("l", "mm", "a3");

    const headers = [
      [
        "STT",
        "Hạng mục kiểm tra",
        "Tiêu chuẩn",
        "Phân loại",
        "Ca",
        ...daysArray.map((d) => d.toString()),
      ],
    ];

    const rows = [];
    reportData.forEach((item, index) => {
      const dayRow = [
        index + 1,
        item.item_name,
        item.standard_value,
        item.item_type,
        "Ngày",
      ];
      const nightRow = ["", "", "", "", "Đêm"];

      daysArray.forEach((day) => {
        const dayVal = item.days?.[day]?.day ?? item.days?.[`${day}_N`] ?? "";
        const nightVal =
          item.days?.[day]?.night ?? item.days?.[`${day}_Đ`] ?? "";
        dayRow.push(dayVal);
        nightRow.push(nightVal);
      });

      rows.push(dayRow);
      rows.push(nightRow);
    });

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
        1: { halign: "left", fontStyle: "bold" },
        2: { halign: "left" },
      },
    });

    doc.save(`Checksheet_Thang_${selectedMonth}.pdf`);
  };

  return (
    <Box sx={{ padding: 3, fontFamily: "Segoe UI, sans-serif" }}>
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
