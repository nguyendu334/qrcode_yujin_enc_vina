import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../helper/api";
import { getChecksheet } from "../../services/checksheetService";

const CreateTicket = () => {
  const location = useLocation();
//   const navigate = useNavigate();

  const [machine, setMachine] = useState(null);
  const [reporterName, setReporterName] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 🔍 Tự động nhận diện Máy từ mã QR (?machine=ID) giống hệt Checkshet
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const machineId = searchParams.get("machine");

    if (machineId) {
      setLoading(true);
      // Sử dụng API lấy thông tin máy có sẵn của bạn
      getChecksheet(machineId)
        .then((res) => {
          setMachine(res.machine);
          setLoading(false);
        })
        .catch(() => {
          setError("Không thể nhận diện thông tin thiết bị này từ QR.");
          setLoading(false);
        });
    } else {
      setError("Vui lòng quét mã QR trên máy để gửi yêu cầu sửa chữa!");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reporterName.trim()) {
      toast.warning("Vui lòng nhập họ tên người báo sự cố!");
      return;
    }
    if (!issueDescription.trim()) {
      toast.warning("Vui lòng mô tả chi tiết sự cố gặp phải!");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/tickets", {
        machine_id: machine.machine_id,
        reporter_name: reporterName,
        issue_description: issueDescription,
        priority: priority,
      });

      toast.success("Đã gửi Ticket báo sự cố tới đội ngũ Bảo trì thành công!");

      // Reset form sau khi gửi
      setIssueDescription("");
      setReporterName("");
      setPriority("NORMAL");
    } catch (err) {
      toast.error(
        "Gửi yêu cầu thất bại: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        Đang tải thông tin thiết bị...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          color: "#ef4444",
          textAlign: "center",
          padding: "40px",
          fontWeight: "bold",
        }}
      >
        ❌ {error}
      </div>
    );

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "20px auto",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#b91c1c",
          marginBottom: "5px",
          fontSize: "20px",
        }}
      >
        ⚠️ BÁO CÁO SỰ CỐ THIẾT BỊ
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "#64748b",
          fontSize: "14px",
          marginBottom: "25px",
        }}
      >
        Gửi yêu cầu sửa chữa
      </p>

      {machine && (
        <div
          style={{
            backgroundColor: "#f8fafc",
            padding: "12px",
            borderRadius: "8px",
            borderLeft: "4px solid #ef4444",
            marginBottom: "20px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            THIẾT BỊ PHÁT SINH SỰ CỐ:
          </div>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              color: "#1e293b",
              marginTop: "3px",
            }}
          >
            {machine.machine_code} - {machine.machine_name}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
            Khu vực: {machine.line_no}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Người báo cáo */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Người phát hiện sự cố *
          </label>
          <input
            type="text"
            placeholder="Nhập tên của bạn..."
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              outline: "none",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Mức độ ưu tiên */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Mức độ khẩn cấp của lỗi
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              outline: "none",
              fontSize: "14px",
              backgroundColor: "#fff",
            }}
          >
            <option value="LOW">Thấp (Có thể sửa sau)</option>
            <option value="NORMAL">Bình thường (Sửa trong ca)</option>
            <option value="HIGH">Khẩn cấp (Dừng máy, cần sửa ngay!)</option>
          </select>
        </div>

        {/* Mô tả chi tiết lỗi */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Mô tả hiện tượng sự cố *
          </label>
          <textarea
            rows="4"
            placeholder="Ví dụ: Máy phát ra tiếng kêu lạ, băng tải bị kẹt không quay được, màn hình điều khiển không lên nguồn..."
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              outline: "none",
              fontSize: "14px",
              resize: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Nút gửi */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            backgroundColor: submitting ? "#cbd5e1" : "#ef4444",
            color: "#fff",
            fontWeight: "bold",
            padding: "12px",
            border: "none",
            borderRadius: "6px",
            cursor: submitting ? "not-allowed" : "pointer",
            fontSize: "16px",
            transition: "all 0.2s",
          }}
        >
          {submitting ? "Đang gửi yêu cầu..." : "Gửi Yêu Cầu Hỗ Trợ"}
        </button>
      </form>
    </div>
  );
};

export default CreateTicket;
