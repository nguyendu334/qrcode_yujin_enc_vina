import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getChecksheet } from "../../services/checksheetService";

const MachineMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Bóc tách ID máy từ link QR (?machine=...)
    const searchParams = new URLSearchParams(location.search);
    const machineId = searchParams.get("machine");

    if (machineId) {
      // Tận dụng API lấy thông tin máy có sẵn của bạn
      getChecksheet(machineId)
        .then((res) => {
          setMachine(res.machine);
          setLoading(false);
        })
        .catch(() => {
          setError("Không tìm thấy thông tin thiết bị này.");
          setLoading(false);
        });
    } else {
      setError("Mã QR không hợp lệ hoặc thiếu thông tin thiết bị.");
      setLoading(false);
    }
  }, [location]);

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "5px",
          marginTop: "50px",
          color: "#64748b",
        }}
      >
        Đang nhận diện thiết bị...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          color: "#ef4444",
          textAlign: "center",
          padding: "20px",
          fontWeight: "bold",
        }}
      >
        ❌ {error}
      </div>
    );

  return (
    <div
      style={{
        maxWidth: "450px",
        margin: "20px auto",
        padding: "20px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* KHU VỰC HIỂN THỊ THÔNG TIN MÁY ĐƯỢC QUÉT */}
      {machine && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "35px",
            backgroundColor: "#f8fafc",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "50px", marginBottom: "10px" }}>⚙️</div>

          <span
            style={{
              backgroundColor: "#3b82f6",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {machine.machine_code}
          </span>
          <h2 style={{ marginTop: "8px", color: "#1e293b", fontSize: "22px" }}>
            {machine.machine_name}
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Line: {machine.line_no}
          </p>
          <h2
            style={{
              marginTop: "8px",
              fontSize: "22px",
              fontWeight: "600",
            }}
          >
            Người phụ trách: {machine.approver_name}
          </h2>
        </div>
      )}

      <h3
        style={{
          textAlign: "center",
          color: "#475569",
          fontSize: "15px",
          marginBottom: "20px",
        }}
      >
        Vui lòng chọn tác vụ bạn muốn thực hiện:
      </h3>

      {/* KHU VỰC CÁC LỰA CHỌN HÀNH ĐỘNG */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {/* LỰA CHỌN 1: LÀM CHECKSHEET */}
        <button
          onClick={() => navigate(`/checksheet?machine=${machine.machine_id}`)}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "20px",
            backgroundColor: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)",
            textAlign: "left",
            transition: "transform 0.1s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: "30px", marginRight: "15px" }}>📋</span>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>
              KIỂM TRA ĐỊNH KỲ (CHECKSHEET)
            </div>
            <div
              style={{ fontSize: "12px", color: "#a7f3d0", marginTop: "3px" }}
            >
              Thực hiện kiểm tra máy đầu ca hoặc định kỳ hàng ngày
            </div>
          </div>
        </button>

        {/* LỰA CHỌN 2: BÁO CÁO SỰ CỐ (TICKET) */}
        <button
          onClick={() =>
            navigate(`/create-ticket?machine=${machine.machine_id}`)
          }
          style={{
            display: "flex",
            alignItems: "center",
            padding: "20px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)",
            textAlign: "left",
            transition: "transform 0.1s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: "30px", marginRight: "15px" }}>⚠️</span>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>
              BÁO CÁO SỰ CỐ THIẾT BỊ
            </div>
            <div
              style={{ fontSize: "12px", color: "#fca5a5", marginTop: "3px" }}
            >
              Máy gặp sự cố hỏng hóc, cần gọi sửa chữa gấp
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MachineMenu;
