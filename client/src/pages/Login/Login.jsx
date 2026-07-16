/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Divider,
  Fade,
  InputBase,
} from "@mui/material";
import {
  Person as UserIcon,
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

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

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // 1. Màu nền Gradient rực rỡ chính xác như ảnh gốc bạn gửi
        background:
          "linear-gradient(135deg, #005eff 0%, #9e1beb 35%, #f12d80 70%, #f15238 100%)",
        fontFamily: '"Plus Jakarta Sans", "Poppins", "Segoe UI", sans-serif',
        margin: 0,
        padding: "20px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Fade in={true} timeout={800}>
        <Card
          elevation={12}
          sx={{
            display: "flex",
            width: "880px",
            maxWidth: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            overflow: "hidden",
            minHeight: "460px",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* BÊN TRÁI: KHU VỰC THƯƠNG HIỆU (Chỉ chứa logo có vòng tròn xanh và hình trang trí) */}
          <Box
            sx={{
              flex: 1,
              background: "#f4f7f6",
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
          
            <Box
              sx={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, #c9f0fc 0%, #e8f9fd 60%, rgba(255,255,255,0) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box
                component="img"
                src="../yujin_logo.png"
                alt="Logo"
                sx={{
                  maxWidth: "115px",
                  height: "auto",
                  zIndex: 2,
                }}
              />
            </Box>

            <Box
              sx={{
                position: "absolute",
                top: "30%",
                right: "25%",
                width: "8px",
                height: "8px",
                border: "2px solid #56ccf2",
                transform: "rotate(45deg)",
                opacity: 0.7,
              }}
            />
            {/* Hình tròn xanh dương phía dưới bên phải */}
            <Box
              sx={{
                position: "absolute",
                bottom: "35%",
                right: "22%",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#56ccf2",
                opacity: 0.8,
              }}
            />
            {/* Hình tròn xanh dương nhỏ phía trên bên trái */}
            <Box
              sx={{
                position: "absolute",
                top: "35%",
                left: "22%",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#56ccf2",
                opacity: 0.8,
              }}
            />
            {/* Tam giác xanh lá phía dưới bên trái */}
            <Box
              sx={{
                position: "absolute",
                bottom: "33%",
                left: "18%",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderBottom: "10px solid #2ecc71",
                transform: "rotate(-15deg)",
                opacity: 0.8,
              }}
            />
          </Box>

          {/* BÊN PHẢI: FORM ĐĂNG NHẬP */}
          <Box
            sx={{
              flex: 1.1,
              padding: { xs: "30px 20px", sm: "45px 50px" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Chữ thương hiệu nằm bên phải, ngay trên form đăng nhập */}
            <Typography
              variant="h5"
              sx={{
                fontSize: "22px",
                fontWeight: "800",
                color: "#1a2c42",
                textAlign: "center",
                mb: "24px",
                letterSpacing: "1px",
              }}
            >
              YUJIN ENC VINA
            </Typography>

            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* Ô NHẬP TÀI KHOẢN (Màu xám/xanh nhạt không viền, bo tròn dạng kẹo) */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "30px", // Bo tròn pill-shape tuyệt đối
                  backgroundColor: "#e8eff9", // Màu xám xanh chuẩn ảnh gốc
                  padding: "8px 18px",
                  gap: "10px",
                  border: "1px solid transparent",
                  transition: "all 0.2s ease-in-out",
                  "&:focus-within": {
                    backgroundColor: "#ffffff",
                    borderColor: "#56ccf2",
                    boxShadow: "0 0 8px rgba(86, 204, 242, 0.25)",
                  },
                }}
              >
                {/* Luôn hiển thị Icon */}
                <UserIcon sx={{ color: "#8fa0b5", fontSize: "22px" }} />
                <InputBase
                  placeholder={t(`username`)}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  fullWidth
                  sx={{
                    fontSize: "18px",
                    color: "#334155",
                    fontWeight: "500",
                    "& input::placeholder": {
                      color: "#8fa0b5",
                      opacity: 1,
                    },
                  }}
                />
              </Box>

              {/* Ô NHẬP MẬT KHẨU (Màu xám/xanh nhạt không viền, bo tròn dạng kẹo) */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "30px",
                  backgroundColor: "#e8eff9",
                  padding: "8px 18px",
                  gap: "10px",
                  border: "1px solid transparent",
                  transition: "all 0.2s ease-in-out",
                  "&:focus-within": {
                    backgroundColor: "#ffffff",
                    borderColor: "#56ccf2",
                    boxShadow: "0 0 8px rgba(86, 204, 242, 0.25)",
                  },
                }}
              >
                <LockIcon sx={{ color: "#8fa0b5", fontSize: "22px" }} />
                <InputBase
                  type={showPassword ? "text" : "password"}
                  placeholder={t(`password`)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  sx={{
                    fontSize: "18px",
                    color: "#334155",
                    fontWeight: "500",
                    "& input::placeholder": {
                      color: "#8fa0b5",
                      opacity: 1,
                    },
                  }}
                />
                <IconButton
                  onClick={handleClickShowPassword}
                  edge="end"
                  size="small"
                  sx={{ color: "#8fa0b5" }}
                >
                  {showPassword ? (
                    <VisibilityOff sx={{ fontSize: "18px" }} />
                  ) : (
                    <Visibility sx={{ fontSize: "18px" }} />
                  )}
                </IconButton>
              </Box>

              {/* NÚT ĐĂNG NHẬP (Xanh cyan sáng, bo tròn pill-shape như thiết kế gốc) */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  width: "50%",
                  margin: "0 auto",
                  padding: "24px 0",
                  borderRadius: "30px",
                  backgroundColor: "#50cbf5",
                  boxShadow: "0 4px 14px rgba(80, 203, 245, 0.3)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: "10px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#3eb7e0",
                    boxShadow: "0 6px 20px rgba(80, 203, 245, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  "&:active": {
                    transform: "translateY(1px)",
                  },
                }}
              >
                {t(`login`)}
              </Button>
            </Box>

            <Divider sx={{ mt: "40px", borderColor: "#f0f0f0" }} />

            {/* KHU VỰC CHỌN NGÔN NGỮ (Sắp xếp nằm ngang gọn gàng phía dưới cùng) */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "42px",
                marginTop: "32px",
              }}
            >
              {[
                {
                  code: "ko",
                  label: "한국어",
                  flag: "https://flagcdn.com/w40/kr.png",
                },
                {
                  code: "en",
                  label: "English",
                  flag: "https://flagcdn.com/w40/gb.png",
                },
                {
                  code: "vi",
                  label: "Tiếng Việt",
                  flag: "https://flagcdn.com/w40/vn.png",
                },
              ].map((lang) => {
                const isSelected = i18n.language === lang.code;

                return (
                  <Button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      padding: "24px 18px",
                      borderRadius: "12px",
                      backgroundColor: "transparent",
                      border: isSelected
                        ? "1.5px solid #2f80ed"
                        : "1.5px solid transparent",
                      textTransform: "none",
                      minWidth: "75px",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                      },
                    }}
                  >
                    {/* Ảnh cờ tổ quốc */}
                    <Box
                      component="img"
                      src={lang.flag}
                      alt={lang.label}
                      sx={{
                        width: "32px",
                        borderRadius: "2px",
                        objectFit: "cover",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                      }}
                    />
                    {/* Tên ngôn ngữ phía dưới */}
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: isSelected ? "700" : "500",
                        color: isSelected ? "#2f80ed" : "#64748b",
                        lineHeight: 1,
                      }}
                    >
                      {lang.label}
                    </Typography>
                  </Button>
                );
              })}
            </Box>
          </Box>
        </Card>
      </Fade>
    </Box>
  );
}
export default Login;
