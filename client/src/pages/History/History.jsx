/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { getMachines } from "../../services/machineService";
import {
  getInspectionDetail,
  getInspectionHeader,
  updateApprove,
} from "../../services/inspectionService";
import FormSearch from "../../components/historyInspection/formSearch";
import InspectionHeader from "../../components/historyInspection/InspectionHeader";
import InspectionDetail from "../../components/historyInspection/InspectionDetail";

export default function InspectionHistory() {
  const { t } = useTranslation();
  const [headers, setHeaders] = useState([]);
  const [details, setDetails] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedInspectionId, setSelectedInspectionId] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [currentApproverId, setCurrentApproverId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Bộ lọc tìm kiếm
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    machineId: "",
    shift: "",
  });

  // Quản lý phân trang bảng trên (Tối đa 5 dòng)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. FETCH DANH SÁCH MÁY DÙNG FILE HELPER
  useEffect(() => {
    getMachines()
      .then((res) => {
        setMachines(res);
      })
      .catch((err) => console.error("Lỗi lấy danh mục máy:", err));
  }, []);

  // 2. FETCH HEADERS DÙNG FILE HELPER
  const fetchHeaders = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await getInspectionHeader({
        params: {
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          machineId: filters.machineId,
          shift: filters.shift,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.success) {
        const dataHeaders = response.data;
        setHeaders(dataHeaders);
        setCurrentPage(1); // Reset về trang 1
        // Tự động kích hoạt chi tiết dòng đầu tiên nếu có dữ liệu
        if (dataHeaders.length > 0) {
          // Sử dụng thuộc tính inspection_id từ DB hoặc trường id tương ứng được map
          const firstId = dataHeaders[0].inspection_id || dataHeaders[0].id;
          handleSelectHeader(firstId);
        } else {
          setDetails([]);
          setSelectedInspectionId(null);
        }
      }
    } catch (error) {
      console.error("Lỗi khi fetch headers:", error);
    }
  }, [filters]);

  useEffect(() => {
    fetchHeaders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. FETCH CHI TIẾT KHI CLICK DÒNG
  const handleSelectHeader = async (inspectionId) => {
    if (!inspectionId) return;
    setSelectedInspectionId(inspectionId);

    const selectedHeader = headers.find(
      (h) => (h.inspection_id || h.id) === inspectionId
    );

    if (selectedHeader) {
      setCurrentApproverId(selectedHeader.approver_id); // Lưu lại ID người duyệt của phiếu này
      console.log(currentApproverId);
    }

    try {
      const response = await getInspectionDetail(inspectionId);
      if (response.success) {
        setDetails(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi fetch chi tiết:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHeaders();
  };

  const handleReset = () => {
    setFilters({ fromDate: "", toDate: "", machineId: "", shift: "" });
    setTimeout(() => fetchHeaders(), 50);
  };

  // LOGIC TÍNH TOÁN NGẮT DÒNG PHÂN TRANG (Mỗi trang hiển thị tối đa 5 dòng như hình image_1d69a7.png)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHeaders = headers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(headers.length / itemsPerPage) || 1;

  // 2. 🌟 HÀM XỬ LÝ GỌI API PHÊ DUYỆT / TỪ CHỐI
  const handleApproveAction = async (statusAction) => {
    // Lấy dòng đầu tiên để biết được inspection_id đang xem
    const currentInspectionId = details[0]?.inspection_id;
    if (!currentInspectionId) return;

    try {
      const token = localStorage.getItem("token"); // Lấy token đăng nhập
      await updateApprove(
        currentInspectionId,
        {
          status: statusAction, // 'approved' hoặc 'rejected'
          comment: approvalComment, // Nội dung ghi chú từ ô textarea
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Done!");
      setApprovalComment(""); // Xóa trắng ô nhập chữ sau khi bấm thành công

      // 🔥 Gọi hàm tải lại dữ liệu lập tức để giao diện đổi màu sắc mới luôn
      if (typeof fetchHeaders === "function") fetchHeaders();
      if (typeof handleSelectHeader === "function")
        handleSelectHeader(currentInspectionId);
    } catch (error) {
      toast.error(
        "Có lỗi xảy ra: " + (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 4,
        }}
      >
        <Typography variant="h5">{t(`history.title`)}</Typography>

        <Typography color="text.secondary">{t(`history.content`)}</Typography>
      </Paper>

      {/* KHU VỰC BỘ LỌC TÌM KIẾM */}
      <FormSearch
        handleSearch={handleSearch}
        t={t}
        filters={filters}
        setFilters={setFilters}
        machines={machines}
        handleReset={handleReset}
      />

      {/* BẢNG 1: INSPECTION HEADER (CHỈ HIỂN THỊ TỐI ĐA 5 DÒNG) */}
      <InspectionHeader
        t={t}
        headers={headers}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        currentHeaders={currentHeaders}
        handleSelectHeader={handleSelectHeader}
        selectedInspectionId={selectedInspectionId}
      />

      {/* BẢNG 2: INSPECTION DETAIL */}
      <InspectionDetail
        t={t}
        details={details}
        currentUser={currentUser}
        currentApproverId={currentApproverId}
        setApprovalComment={setApprovalComment}
        handleApproveAction={handleApproveAction}
      />
    </Box>
  );
}
