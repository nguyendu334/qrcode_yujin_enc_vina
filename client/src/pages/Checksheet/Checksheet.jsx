import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getChecksheet,
  sendInfoChecksheet,
} from "../../services/checksheetService";
import HeaderCard from "../../components/checksheet/HeaderCard";
import ChecklistItem from "../../components/checksheet/ChecklistItem";
import FooterSubmit from "../../components/checksheet/FooterSubmit";
import api from "../../helper/api";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";

// const getCurrentShift = () => {
//   const hours = new Date().getHours();
//   // Khung giờ từ 08:00 đến 19:59 là Ca ngày, còn lại là Ca đêm
//   if (hours >= 8 && hours < 20) {
//     return "Ca ngày";
//   }
//   return "Ca đêm";
// };

const getCurrentShift = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const mockHour = searchParams.get("mockHour");

  // Nếu trên URL có &mockHour=21 thì lấy 21h, không thì lấy giờ thật của máy
  const hours =
    mockHour !== null ? parseInt(mockHour, 10) : new Date().getHours();

  if (hours >= 8 && hours < 20) {
    return "Ca ngày";
  }
  return "Ca đêm";
};

function ChecksheetPage() {
  const location = useLocation();

  // State quản lý dữ liệu từ API
  const [machine, setMachine] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);

  // State form thông tin chung (Header)
  const [inspector, setInspector] = useState("");
  const [shift, setShift] = useState(getCurrentShift());
  const [currentTime, setCurrentTime] = useState("");
  const [results, setResults] = useState({});

  const [approvers, setApprovers] = useState([]);
  const [selectedApproverId, setSelectedApproverId] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    // 1. Đồng bộ thời gian thực tế hiển thị trên form và tự cập nhật Ca
    const now = new Date();
    const formattedTime = now.toISOString();
    setCurrentTime(formattedTime);

    const autoShift = getCurrentShift();
    setShift(autoShift);

    // 2. Bóc tách query param "?machine=..." từ link QR
    const searchParams = new URLSearchParams(location.search);
    const machineId = searchParams.get("machine");

    // Hàm phụ trợ kiểm tra trùng lặp
    const verifyDuplicate = async (mId, currentShift) => {
      try {
        const todayStr = new Date().toISOString().split("T")[0];

        const res = await api.get("/inspections/check-duplicate", {
          params: {
            machine_id: mId,
            date: todayStr,
            shift: currentShift,
          },
        });

        setIsDuplicate(res.data.isDuplicate);
      } catch (err) {
        console.error("Lỗi kiểm tra trùng lặp lịch checksheet:", err);
      }
    };

    if (machineId) {
      // 🌟 CHECK TRÙNG LẶP THEO CA ĐÃ TỰ ĐỘNG TÍNH
      verifyDuplicate(machineId, autoShift);

      // Gọi API Backend lấy thông tin máy và bộ checklist_item
      getChecksheet(machineId)
        .then((res) => {
          setMachine(res.machine);
          setChecklistItems(res.checklistItems);

          const initialResults = {};
          res.checklistItems.forEach((item) => {
            initialResults[item.item_id] = { type: item.item_type, value: "" };
          });
          setResults(initialResults);
          setLoading(false);
        })
        .catch((err) => {
          setError(
            err.response?.data?.error ||
              "Không thể tải cấu hình hạng mục cho thiết bị này."
          );
          setLoading(false);
        });

      api
        .get(`/approvers/by-machine/${machineId}`)
        .then((res) => {
          setApprovers(res.data);
          // Nếu bộ phận chỉ có đúng 1 người duyệt, tự động chọn sẵn
          if (res.data.length === 1) {
            setSelectedApproverId(res.data[0].user_id);
          }
        })
        .catch((err) => console.error("Lỗi lấy người duyệt:", err));
    } else {
      setError("Quét mã QR để nhận diện Checksheet.");
      setLoading(false);
    }
  }, [location]);

  // Xử lý sự kiện khi click nút chọn nhanh OK / NG
  const handleStatusChange = (itemId, statusValue) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], value: statusValue },
    }));
  };

  // Xử lý sự kiện nhập chữ tự do cho ô TEXT
  const handleTextChange = (itemId, textValue) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], value: textValue },
    }));
  };

  // Gửi toàn bộ dữ liệu kiểm tra lên Server
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedApproverId) {
      toast.warning("Vui lòng chọn Người phê duyệt!");
      return;
    }

    if (isDuplicate) {
      toast.error("Thiết bị này đã được kiểm tra. Không thể nộp thêm!");
      return;
    }

    if (!inspector.trim()) {
      toast.warning("Vui lòng nhập họ tên Người kiểm tra!");
      return;
    }

    // Chuẩn hóa dữ liệu kết quả kiểm tra
    const formattedDetails = checklistItems.map((item) => {
      const userValue = results[item.item_id]?.value;
      const remarkValue = results[item.item_id]?.remark || null;

      let resultField = null;
      let valueField = null;

      if (item.item_type === "OKNG" || item.item_type === "OK_NG") {
        resultField = userValue || "OK";
        valueField = null;
      } else {
        resultField = null;
        valueField = userValue !== undefined ? userValue : "";
      }

      return {
        item_id: item.item_id,
        result: resultField,
        value: valueField,
        remark: remarkValue,
      };
    });

    const payload = {
      machine_id: machine.machine_id,
      inspector: inspector,
      inspection_date: currentTime,
      shift: shift, // 🌟 Gửi Ca tự động
      check_results: formattedDetails,
      // approver_id: machine.approver_id,
      approver_id: selectedApproverId,
    };
    setSelectedApproverId("");

    try {
      await sendInfoChecksheet(payload);

      toast.success("Đã lưu dữ liệu vào hệ thống Inspection thành công!");

      setIsDuplicate(true);

      setInspector("");

      // Reset toàn bộ kết quả về mặc định
      const resetResults = {};
      checklistItems.forEach((item) => {
        resetResults[item.item_id] = { type: item.item_type, value: "" };
      });
      setResults(resetResults);

      const now = new Date();
      setCurrentTime(now.toISOString());
    } catch (err) {
      console.error("Lỗi gửi dữ liệu checksheet:", err);
      toast.error(
        "Lỗi nộp phiếu: " + (err.response?.data?.error || err.message)
      );
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center", color: "#64748b" }}>
        🔄 Đang đồng bộ thông tin thiết bị và hạng mục...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "50px",
          color: "#dc3545",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        ❌ {error}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1050px",
        margin: "0 auto",
        padding: "40px 24px",
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <Button
        sx={{ marginBottom: "20px" }}
        variant="outlined"
        onClick={() => window.history.back()}
      >
        {t("back")}
      </Button>

      <h2
        style={{
          textAlign: "center",
          textTransform: "uppercase",
          marginBottom: "40px",
          color: "#0f172a",
          fontSize: "22px",
          fontWeight: "700",
          letterSpacing: "0.5px",
        }}
      >
        {machine?.machine_type_name
          ? `${machine.machine_type_name} ${
              machine.frequency || "Weekly"
            } Checksheet`
          : "Machine Checksheet"}
      </h2>

      {/* BLOCK THÔNG TIN HEADER */}
      <HeaderCard
        machine={machine}
        inspector={inspector}
        setInspector={setInspector}
        currentTime={currentTime}
        shift={shift}
        setShift={setShift}
        disabledShift={true} // 🌟 Khóa không cho phép sửa Ca
        approvers={approvers} // 🌟 Truyền danh sách người duyệt
        selectedApproverId={selectedApproverId} // 🌟 Truyền ID được chọn
        setSelectedApproverId={setSelectedApproverId} // 🌟 Hàm cập nhật
      />

      <ChecklistItem
        checklistItems={checklistItems}
        handleStatusChange={handleStatusChange}
        results={results}
        handleTextChange={handleTextChange}
      />

      {checklistItems.length > 0 && (
        <FooterSubmit handleSubmit={handleSubmit} isDuplicate={isDuplicate} />
      )}
    </div>
  );
}

export default ChecksheetPage;
