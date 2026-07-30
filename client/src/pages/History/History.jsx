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

  // 1. FETCH DANH SÁCH MÁY
  useEffect(() => {
    getMachines()
      .then((res) => {
        setMachines(res);
      })
      .catch((err) => console.error("Lỗi lấy danh mục máy:", err));
  }, []);

  // 3. FETCH CHI TIẾT KHI CLICK DÒNG (Định nghĩa trước fetchHeaders)
  const handleSelectHeader = useCallback(
    async (inspectionId, headersList = headers) => {
      if (!inspectionId) return;
      setSelectedInspectionId(inspectionId);

      // Tìm thông tin header tương ứng để lấy approver_id
      const selectedHeader = headersList.find(
        (h) => (h.inspection_id || h.id) === inspectionId
      );

      if (selectedHeader) {
        setCurrentApproverId(selectedHeader.approver_id);
      }

      try {
        const response = await getInspectionDetail(inspectionId);
        if (response.success) {
          setDetails(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi fetch chi tiết:", error);
      }
    },
    [headers]
  );

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

        // Tự động chọn dòng đầu tiên nếu có dữ liệu
        if (dataHeaders.length > 0) {
          const firstId = dataHeaders[0].inspection_id || dataHeaders[0].id;
          handleSelectHeader(firstId, dataHeaders);
        } else {
          setDetails([]);
          setSelectedInspectionId(null);
          setCurrentApproverId(null);
        }
      }
    } catch (error) {
      console.error("Lỗi khi fetch headers:", error);
    }
  }, [filters, handleSelectHeader]);

  useEffect(() => {
    fetchHeaders();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHeaders();
  };

  const handleReset = () => {
    setFilters({ fromDate: "", toDate: "", machineId: "", shift: "" });
    setTimeout(() => fetchHeaders(), 50);
  };

  // TÍNH TOÁN PHÂN TRANG (Mỗi trang 5 dòng)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHeaders = headers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(headers.length / itemsPerPage) || 1;

  // 4. HÀM XỬ LÝ GỌI API PHÊ DUYỆT / TỪ CHỐI
  const handleApproveAction = async (statusAction) => {
    if (!selectedInspectionId) {
      toast.warning("Vui lòng chọn phiếu kiểm tra!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await updateApprove(
        selectedInspectionId,
        {
          status: statusAction, // 'approved' hoặc 'rejected'
          comment: approvalComment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        statusAction === "approved"
          ? "Phê duyệt thành công!"
          : "Đã từ chối phiếu kiểm tra!"
      );
      setApprovalComment(""); // Clear comment box

      // Refresh lại dữ liệu
      await fetchHeaders();
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
      <Paper sx={{ p: 2, mb: 1, borderRadius: 4 }}>
        <Typography variant="h5">{t(`history.title`)}</Typography>
        <Typography color="text.secondary">{t(`history.content`)}</Typography>
      </Paper>

      {/* BỘ LỌC TÌM KIẾM */}
      <FormSearch
        handleSearch={handleSearch}
        t={t}
        filters={filters}
        setFilters={setFilters}
        machines={machines}
        handleReset={handleReset}
      />

      {/* BẢNG 1: INSPECTION HEADER */}
      <InspectionHeader
        t={t}
        headers={headers}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        currentHeaders={currentHeaders}
        handleSelectHeader={(id) => handleSelectHeader(id, headers)}
        selectedInspectionId={selectedInspectionId}
      />

      {/* BẢNG 2: INSPECTION DETAIL */}
      <InspectionDetail
        t={t}
        details={details}
        currentUser={currentUser}
        currentApproverId={currentApproverId}
        approvalComment={approvalComment}
        setApprovalComment={setApprovalComment}
        handleApproveAction={handleApproveAction}
      />
    </Box>
  );
}