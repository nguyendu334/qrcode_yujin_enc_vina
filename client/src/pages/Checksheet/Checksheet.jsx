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

function ChecksheetPage() {
  const location = useLocation();

  // State quản lý dữ liệu từ API
  const [machine, setMachine] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State form thông tin chung (Header)
  const [inspector, setInspector] = useState("");
  const [shift, setShift] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // State lưu kết quả động: { [item_id]: { type: 'OKNG'/'TEXT', value: '' } }
  const [results, setResults] = useState({});

  useEffect(() => {
    // 1. Đồng bộ thời gian thực tế hiển thị trên form (YYYY-MM-DD HH:mm:ss) hoặc định dạng Date tương thích
    const now = new Date();
    const formattedTime = now.toISOString(); // Hoặc định dạng chuỗi tuỳ biến theo kiểu dữ liệu cột inspection_date của bạn
    setCurrentTime(formattedTime);

    // 2. Bóc tách query param "?machine=..." từ link QR
    const searchParams = new URLSearchParams(location.search);
    const machineId = searchParams.get("machine");

    if (machineId) {
      // Gọi API Backend lấy thông tin máy và bộ checklist_item đi kèm
      getChecksheet(machineId)
        .then((res) => {
          setMachine(res.machine);
          setChecklistItems(res.checklistItems);
          // Khởi tạo trạng thái lưu trữ kèm phân loại item_type để gom payload chuẩn xác
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

  // Xử lý sự kiện nhập chữ tự do cho ô TEXT (Mục Remark)
  const handleTextChange = (itemId, textValue) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], value: textValue },
    }));
  };

  // Gửi toàn bộ dữ liệu kiểm tra lên Server (Lưu song song Header & Detail)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inspector.trim()) {
      toast.warning("Vui lòng nhập họ tên Người kiểm tra!");
      return;
    }
    if (!shift) {
      toast.warning("Vui lòng chọn Ca làm việc!");
      return;
    }

    // ========================================================
    // LOGIC CHUẨN HÓA DỮ LIỆU ĐẦU RA (Tách biệt result và value)
    // ========================================================
    const formattedDetails = checklistItems.map((item) => {
      const userValue = results[item.item_id]?.value;
      // Giả sử bạn có một state lưu remark riêng, hoặc nếu lưu chung cấu trúc thì lấy ra
      const remarkValue = results[item.item_id]?.remark || null;

      let resultField = null;
      let valueField = null;

      if (item.item_type === "OKNG") {
        // Loại OKNG: Chỉ lưu vào cột result, cột value để null
        resultField = userValue || "OK";
        valueField = null;
      } else {
        // Loại nhập số/chữ: Chỉ lưu vào cột value, cột result để null
        resultField = null;
        valueField = userValue !== undefined ? userValue : "";
      }

      return {
        item_id: item.item_id,
        result: resultField,
        value: valueField,
        remark: remarkValue, // Gửi thêm remark lên cho Backend nhận diện
      };
    });

    // Khối Payload mới gửi lên Backend
    const payload = {
      machine_id: machine.machine_id,
      inspector: inspector,
      inspection_date: currentTime,
      shift: shift,
      check_results: formattedDetails,
      // 🌟 LẤY TRỰC TIẾP ID NGƯỜI DUYỆT CÓ SẴN TỪ OBJECT MACHINE
      approver_id: machine.approver_id, // 🌟 BỔ SUNG: Gửi kèm ID người duyệt lên Backend
    };

    try {
      // Gọi API POST gửi gói tin lên xử lý transaction lưu đồng thời 2 bảng
      sendInfoChecksheet(payload);
      toast.success("Đã lưu dữ liệu vào hệ thống Inspection thành công!");
      // ========================================================
      // LOGIC XÓA TRƯỜNG DỮ LIỆU VỪA NHẬP SAU KHI HOÀN THÀNH
      // ========================================================
      setInspector(""); // Xóa trắng tên người kiểm tra
      setShift(""); // Đưa ca làm việc về mặc định "Chọn ca"

      // Reset toàn bộ kết quả đã chọn hoặc nhập trên bảng về rỗng
      const resetResults = {};
      checklistItems.forEach((item) => {
        resetResults[item.item_id] = { type: item.item_type, value: "" };
      });
      setResults(resetResults);

      // Cập nhật lại mốc thời gian mới cho lượt kiểm tra tiếp theo
      const now = new Date();
      setCurrentTime(now.toISOString());
    } catch (err) {
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
      {/* TIÊU ĐỀ BIẾN ĐỔI ĐỘNG */}
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
      />

      {/* BẢNG RENDER HẠNG MỤC TỰ ĐỘNG ĐỔI GIAO DIỆN */}
      <ChecklistItem
        checklistItems={checklistItems}
        handleStatusChange={handleStatusChange}
        results={results}
        handleTextChange={handleTextChange}
      />
      {/* NÚT HOÀN THÀNH */}
      {checklistItems.length > 0 && (
        <FooterSubmit handleSubmit={handleSubmit} />
      )}
    </div>
  );
}

export default ChecksheetPage;
