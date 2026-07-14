/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { User, Lock } from "lucide-react";
import { toast } from "react-toastify";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { loginAPI } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

// eslint-disable-next-line react/prop-types
function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const { i18n, t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await loginAPI(username, password);

      if (!res.success) {
        toast.error("Đăng nhập thất bại");
        return;
      }
      login(res.token, res.user);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Màu nền Gradient
        background:
          "linear-gradient(135deg, #0268f7 0%, #458db1 30%, #bb4ac4 70%, #e9532e 100%)",
        fontFamily: '"Poppins", "Segoe UI", sans-serif',
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      {/* KHUNG TRẮNG TRUNG TÂM */}
      <div
        style={{
          display: "flex",
          width: "850px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
          minHeight: "480px",
        }}
      >
        {/* BÊN TRÁI: HÌNH ẢNH MINH HỌA (MÁY TÍNH VÀ CÁC CHI TIẾT TRANG TRÍ) */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: "40px",
          }}
        >
          {/* Các họa tiết hình học nhỏ xung quanh giống ảnh */}
          <div
            style={{
              position: "absolute",
              top: "25%",
              left: "20%",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "3px solid #38bdf8",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              bottom: "25%",
              right: "20%",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              border: "3px solid #38bdf8",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              top: "20%",
              right: "25%",
              width: "10px",
              height: "10px",
              border: "2px solid #cbd5e1",
              transform: "rotate(45deg)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              bottom: "25%",
              left: "15%",
              width: "0",
              height: "0",
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "14px solid #4ade80",
              transform: "rotate(-15deg)",
            }}
          ></div>

          {/* Vòng tròn nền và Icon trung tâm */}
          <div
            style={{
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              backgroundColor: "#ccebf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="../yujin_logo.png"
              alt=""
              style={{ maxWidth: "200px", height: "auto" }}
            />
          </div>
        </div>

        {/* BÊN PHẢI: FORM ĐĂNG NHẬP CHÍNH */}
        <div
          style={{
            flex: 1,
            padding: "50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <h2
            style={{
              margin: "0 0 30px 0",
              fontSize: "28px",
              fontWeight: "700",
              color: "#1e293b",
              textAlign: "center",
              letterSpacing: "0.5px",
            }}
          >
            YUJIN ENC VINA
          </h2>

          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Ô NHẬP TÀI KHOẢN (EMAIL) */}
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "18px",
                  top: "14px",
                  color: "#64748b",
                }}
              >
                <User size={18} />
              </span>
              <input
                type="text"
                placeholder={t(`username`)}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 50px",
                  borderRadius: "30px", // Bo tròn hình viên thuốc bo cong hoàn toàn
                  border: "none",
                  backgroundColor: "#e2e8f0", // Màu xám nhạt như hình mẫu
                  fontSize: "14px",
                  color: "#334155",
                  outline: "none",
                  boxSizing: "border-box",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
              />
            </div>

            {/* Ô NHẬP MẬT KHẨU */}
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "18px",
                  top: "14px",
                  color: "#64748b",
                }}
              >
                <Lock size={18} />
              </span>
              <input
                type="password"
                placeholder={t(`password`)}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 50px",
                  borderRadius: "30px",
                  border: "none",
                  backgroundColor: "#e2e8f0",
                  fontSize: "14px",
                  color: "#334155",
                  outline: "none",
                  boxSizing: "border-box",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
              />
            </div>

            {/* NÚT LOGIN */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "30px",
                border: "none",
                backgroundColor: "#5fcff5", // Đúng tông màu xanh lá mượt mà trong ảnh mẫu
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                cursor: "pointer",
                marginTop: "10px",
                boxShadow: "0 4px 12px rgba(87, 184, 70, 0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#00e1ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#5fcff5")
              }
            >
              {t(`login`)}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px", // Khoảng cách giữa các nút
              marginTop: "40px",
              width: "100%",
            }}
          >
            {[
              {
                code: "ko",
                label: "한국어",
                flag: "https://flagcdn.com/w80/kr.png",
              },
              {
                code: "en",
                label: "English",
                flag: "https://flagcdn.com/w80/gb.png",
              },
              {
                code: "vi",
                label: "Tiếng Việt",
                flag: "https://flagcdn.com/w80/vn.png",
              },
            ].map((lang) => {
              const isSelected = i18n.language === lang.code;

              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  style={{
                    // Layout xếp dọc cờ và chữ
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",

                    // Kích thước nút cân đối
                    width: "80px",
                    padding: "8px 4px",

                    // Viền & màu nền thay đổi theo trạng thái Active
                    backgroundColor: isSelected
                      ? "rgba(59, 130, 246, 0.08)"
                      : "transparent",
                    border: isSelected
                      ? "1.5px solid #3b82f6"
                      : "1.5px solid transparent",
                    borderRadius: "12px",

                    // Trực quan & tương tác
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    outline: "none",
                  }}
                  // Hiệu ứng hover nhẹ cho các nút chưa chọn
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Hình ảnh lá cờ */}
                  <img
                    src={lang.flag}
                    alt={lang.label}
                    style={{
                      width: "36px",
                      height: "24px",
                      objectFit: "cover",
                      borderRadius: "4px", // Bo nhẹ góc lá cờ cho hiện đại
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }}
                  />

                  {/* Chữ hiển thị tên ngôn ngữ */}
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: isSelected ? "600" : "400",
                      color: isSelected ? "#3b82f6" : "#94a3b8", // Chữ sáng xanh khi chọn, xám khi chưa chọn
                      transition: "color 0.2s ease",
                    }}
                  >
                    {lang.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
