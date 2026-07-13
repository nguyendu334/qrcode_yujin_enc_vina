/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import {
  addUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../../services/userService";
import {
  Table,
  Button,
  Paper,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";

function UserManagementPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Khởi tạo form đồng bộ chính xác với các trường dữ liệu trong DB của bạn
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "worker",
    active: true,
  });

  // Hàm sinh cấu hình Header mang theo Bearer Token phục vụ verifyToken của backend
  const getAuthConfig = () => {
    const token = localStorage.getItem("token"); // Lấy jwt token từ localStorage
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // 1. Gọi API lấy danh sách
  const fetchUsers = async () => {
    try {
      const response = await getUsers(getAuthConfig());
      // console.log(response);
      setUsers(response);
    } catch (error) {
      // alert(
      //   error.response?.data?.message || "Không thể tải danh sách tài khoản!"
      // );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddClick = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      email: "",
      department_id: "",
      full_name: "",
      role: "worker",
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "",
      email: user.email,
      department_id: user.department_id || "",
      full_name: user.full_name,
      role: user.role,
      active: user.active,
    });
    setIsModalOpen(true);
  };

  // 2. Xử lý Thêm / Sửa dữ liệu
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const userId = editingUser.user_id || editingUser.id || editingUser.use;

        await updateUser(userId, formData, getAuthConfig());
      } else {
        if (!formData.password)
          return alert("Vui lòng nhập mật khẩu cho tài khoản mới!");
        await addUser(formData, getAuthConfig());
      }
      setIsModalOpen(false);
      fetchUsers();
      toast.success("Done!");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Thao tác thất bại!"
      );
    }
  };

  // 3. Xử lý Xóa dữ liệu
  const handleDelete = async (userId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa tài khoản này không? Thao tác không thể hoàn tác."
      )
    ) {
      try {
        // Gọi chính xác endpoint URL, dùng userId được truyền vào
        await deleteUser(userId, getAuthConfig());

        // Báo thành công và load lại bảng dữ liệu
        toast.success("Xoá thành công");
        fetchUsers();
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Lỗi khi xóa người dùng!"
        );
      }
    }
  };

  return (
    <Box sx={{ width: "100%", boxSizing: "border-box" }}>
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 4,
        }}
      >
        <Typography variant="h5">{t(`user.usermanage`)}</Typography>

        <Typography>{t(`user.content`)}</Typography>
      </Paper>
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <Button
          onClick={handleAddClick}
          sx={{
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
          }}
        >
          + {t(`user.adduser`)}
        </Button>
      </Box>

      {/* Table Giao diện */}
      <Box
        sx={{
          overflowX: "auto",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Table
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "15px",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell align="center">{t("user.username")}</TableCell>
              <TableCell align="center">{t("user.fullname")}</TableCell>
              <TableCell align="center">{t("user.email")}</TableCell>
              <TableCell align="center">{t("user.department")}</TableCell>
              <TableCell align="center">{t("user.role")}</TableCell>
              <TableCell align="center">{t("user.status")}</TableCell>
              <TableCell align="center">{t("user.action")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow
                key={u.user_id}
                style={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <TableCell align="center">{u.username}</TableCell>
                <TableCell align="center">{u.full_name}</TableCell>
                <TableCell align="center">{u.email?.toUpperCase()}</TableCell>
                <TableCell align="center">{u.department_name}</TableCell>
                <TableCell align="center">
                  <Typography
                    component="span"
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      backgroundColor:
                        u.role === "admin"
                          ? "#fee2e2"
                          : u.role === "manager"
                          ? "#fef3c7"
                          : "#e0f2fe",
                      color:
                        u.role === "admin"
                          ? "#991b1b"
                          : u.role === "manager"
                          ? "#92400e"
                          : "#0369a1",
                    }}
                  >
                    {u.role.toUpperCase()}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    component="span"
                    sx={{
                      color: u.active ? "#16a34a" : "#dc2626",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    {u.active
                      ? `● ${t(`status.online`)}`
                      : `○ ${t(`status.lock`)}`}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button
                    onClick={() => handleEditClick(u)}
                    style={{
                      marginRight: "12px",
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#A8D4FF")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fff")
                    }
                  >
                    ✏️ {t(`edit`)}
                  </Button>
                  <Button
                    onClick={() => handleDelete(u.user_id)}
                    style={{
                      border: "1px solid #fee2e2",
                      background: "#fff",
                      color: "#dc2626",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#F6BFB1")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fff")
                    }
                  >
                    ❌ {t(`delete`)}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Form Dialog popup */}
      {isModalOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
          }}
        >
          <Box
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "380px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Typography
              variant="h4"
              sx={{ margin: "0 0 16px 0", fontSize: "18px" }}
            >
              {editingUser
                ? "Cập nhật tài khoản nhà xưởng"
                : "Đăng ký tài khoản mới"}
            </Typography>
            <form onSubmit={handleSave}>
              <Box style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Tên tài khoản (Username)
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </Box>
              <Box style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Mật khẩu {editingUser && "(Bỏ trống nếu giữ cũ)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </Box>
              <Box style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </Box>
              <Box style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </Box>

              <Box style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Phòng ban
                </label>
                <select
                  value={formData.department_id}
                  onChange={(e) =>
                    setFormData({ ...formData, department_id: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  <option value="">-- Chọn phòng ban --</option>
                  <option value="1">Production</option>
                  <option value="2">VP</option>
                  <option value="3">TECH</option>
                  <option value="4">QC</option>
                  <option value="5">KHO</option>
                </select>
              </Box>

              <Box style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Phân quyền chức vụ (Role)
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  <option value="worker">Worker (Công nhân)</option>
                  <option value="manager">Manager (Quản lý)</option>
                  <option value="admin">Admin (Hệ thống)</option>
                </select>
              </Box>
              <Box
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="checkbox"
                  id="activeStatus"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                />
                <label
                  htmlFor="activeStatus"
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Kích hoạt tài khoản này
                </label>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  sx={{
                    padding: "8px 14px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  sx={{
                    padding: "8px 14px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Lưu thông tin
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default UserManagementPage;
