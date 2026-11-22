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
  Box,
  Button,
  Card,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

function UserManagementPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    department_id: "",
    role: "worker",
    active: true,
  });

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers(getAuthConfig());
      setUsers(response || []);
    } catch (error) {
      console.error("Lỗi tải danh sách người dùng:", error);
      toast.error("Không thể tải danh sách tài khoản!");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const keyword = searchTerm.toLowerCase();

    return (
      u.username?.toLowerCase().includes(keyword) ||
      u.full_name?.toLowerCase().includes(keyword) ||
      u.email?.toLowerCase().includes(keyword) ||
      u.department_name?.toLowerCase().includes(keyword)
    );
  });

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      full_name: "",
      email: "",
      department_id: "",
      role: "worker",
      active: true,
    });
  };

  const handleAddClick = () => {
    setEditingUser(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);

    setFormData({
      username: user.username || "",
      password: "",
      email: user.email || "",
      department_id: user.department_id || "",
      full_name: user.full_name || "",
      role: user.role || "worker",
      active: user.active ?? true,
    });

    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        const userId = editingUser.user_id || editingUser.id || editingUser.use;

        await updateUser(userId, formData, getAuthConfig());
      } else {
        if (!formData.password) {
          toast.warning("Vui lòng nhập mật khẩu cho tài khoản mới!");
          return;
        }

        await addUser(formData, getAuthConfig());
      }

      setIsModalOpen(false);
      fetchUsers();
      toast.success("Lưu thông tin tài khoản thành công!");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Thao tác thất bại!"
      );
    }
  };

  const handleDelete = async (userId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa tài khoản này không? Thao tác không thể hoàn tác."
      )
    ) {
      try {
        await deleteUser(userId, getAuthConfig());

        toast.success("Xóa tài khoản thành công!");
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

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return { bg: "#fee2e2", color: "#991b1b" };
      case "manager":
        return { bg: "#fef3c7", color: "#92400e" };
      default:
        return { bg: "#e0f2fe", color: "#0369a1" };
    }
  };

  const renderRole = (role) => {
    const colors = getRoleColor(role);

    return (
      <Chip
        size="small"
        label={role?.toUpperCase() || "WORKER"}
        sx={{
          fontWeight: 700,
          backgroundColor: colors.bg,
          color: colors.color,
        }}
      />
    );
  };

  const renderStatus = (active) => (
    <Chip
      size="small"
      label={active ? t("status.online") : t("status.lock")}
      color={active ? "success" : "error"}
      variant="outlined"
    />
  );

  const departments = [
    { id: 1, name: "Production" },
    { id: 2, name: "VP" },
    { id: 3, name: "TECH" },
    { id: 4, name: "QC" },
    { id: 5, name: "KHO" },
  ];

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, sm: 3 },
        px: { xs: 1.5, sm: 3 },
        minWidth: 0,
      }}
    >
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={{ xs: 2.5, sm: 2 }}
        sx={{ mb: 3, width: "100%" }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              fontSize: { xs: 20, sm: 24 },
            }}
          >
            {t("user.usermanage")}
          </Typography>

          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            {t("user.content")}
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth={isMobile}
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            minWidth: { sm: 180 },
            maxWidth: { sm: 220 },
            minHeight: 42,
            flexShrink: 0,
            borderRadius: 2,
            backgroundColor: "#2563eb",
            textTransform: "none",
            fontWeight: 600,
            whiteSpace: "nowrap",
            "&:hover": {
              backgroundColor: "#1d4ed8",
            },
          }}
        >
          {t("user.adduser")}
        </Button>
      </Stack>

      {/* SEARCH */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm tài khoản, họ tên, email, phòng ban..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            maxWidth: { sm: 420 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#94a3b8", mr: 1 }} />,
          }}
        />
      </Card>

      {/* USER LIST */}
      {filteredUsers.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography color="text.secondary">
            Không tìm thấy tài khoản nào.
          </Typography>
        </Paper>
      ) : isMobile ? (
        /* MOBILE CARD */
        <Stack spacing={2}>
          {filteredUsers.map((u, index) => (
            <Card
              key={u.user_id || u.id || index}
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "#94a3b8", fontWeight: 600 }}
                    >
                      #{index + 1} · USER ACCOUNT
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 17,
                        color: "#1e293b",
                        mt: 0.5,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {u.full_name || "—"}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ overflowWrap: "anywhere" }}
                    >
                      @{u.username}
                    </Typography>
                  </Box>

                  {renderStatus(u.active)}
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("user.email")}
                    </Typography>
                    <Typography fontSize={14} sx={{ overflowWrap: "anywhere" }}>
                      {u.email || "—"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("user.department")}
                    </Typography>
                    <Typography fontSize={14} fontWeight={600}>
                      {u.department_name || "—"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("user.role")}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>{renderRole(u.role)}</Box>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              <Stack
                direction="row"
                spacing={1}
                sx={{ p: 1.5, backgroundColor: "#f8fafc" }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => handleEditClick(u)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {t("edit")}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlinedIcon />}
                  onClick={() => handleDelete(u.user_id)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {t("delete")}
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      ) : (
        /* DESKTOP TABLE */
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 950 }}>
            <TableHead sx={{ backgroundColor: "#f8fafc" }}>
              <TableRow>
                {[
                  t("user.username"),
                  t("user.fullname"),
                  t("user.email"),
                  t("user.department"),
                  t("user.role"),
                  t("user.status"),
                  t("user.action"),
                ].map((label) => (
                  <TableCell
                    key={label}
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.user_id || u.id} hover>
                  <TableCell align="center">{u.username}</TableCell>
                  <TableCell align="center">{u.full_name}</TableCell>
                  <TableCell align="center">
                    {u.email?.toUpperCase() || "—"}
                  </TableCell>
                  <TableCell align="center">
                    {u.department_name || "—"}
                  </TableCell>
                  <TableCell align="center">{renderRole(u.role)}</TableCell>
                  <TableCell align="center">{renderStatus(u.active)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditOutlinedIcon />}
                        onClick={() => handleEditClick(u)}
                        sx={{ textTransform: "none" }}
                      >
                        {t("edit")}
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteOutlinedIcon />}
                        onClick={() => handleDelete(u.user_id)}
                        sx={{ textTransform: "none" }}
                      >
                        {t("delete")}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ADD / EDIT DIALOG */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
            p: { xs: 2, sm: 3 },
          }}
        >
          <Typography fontWeight={700}>
            {editingUser
              ? "Cập nhật tài khoản nhà xưởng"
              : "Đăng ký tài khoản mới"}
          </Typography>

          <IconButton onClick={() => setIsModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <Box component="form" onSubmit={handleSave}>
          <DialogContent
            sx={{
              p: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              label="Tên tài khoản (Username)"
              required
              fullWidth
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />

            <TextField
              label={`Mật khẩu ${editingUser ? "(Bỏ trống nếu giữ cũ)" : ""}`}
              type="password"
              required={!editingUser}
              fullWidth
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <TextField
              label="Họ và tên"
              required
              fullWidth
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
            />

            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <FormControl fullWidth>
              <InputLabel>Phòng ban</InputLabel>
              <Select
                value={formData.department_id}
                label="Phòng ban"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department_id: e.target.value,
                  })
                }
              >
                <MenuItem value="">
                  <em>-- Chọn phòng ban --</em>
                </MenuItem>

                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Phân quyền chức vụ (Role)</InputLabel>
              <Select
                value={formData.role}
                label="Phân quyền chức vụ (Role)"
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <MenuItem value="worker">Worker (Công nhân)</MenuItem>
                <MenuItem value="manager">Manager (Quản lý)</MenuItem>
                <MenuItem value="admin">Admin (Hệ thống)</MenuItem>
                <MenuItem value="admin">Head (Hệ thống)</MenuItem>
              </Select>
            </FormControl>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#f8fafc",
              }}
            >
              <Typography fontWeight={500}>Kích hoạt tài khoản này</Typography>

              <Switch
                checked={formData.active}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    active: e.target.checked,
                  })
                }
              />
            </Stack>
          </DialogContent>

          <Divider />

          <DialogActions
            sx={{
              p: { xs: 2, sm: 3 },
              gap: 1,
              flexDirection: { xs: "column-reverse", sm: "row" },
              "& > button": {
                width: { xs: "100%", sm: "auto" },
              },
            }}
          >
            <Button
              type="button"
              color="inherit"
              onClick={() => setIsModalOpen(false)}
              sx={{ textTransform: "none" }}
            >
              Hủy
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{
                px: 3,
                borderRadius: 2,
                backgroundColor: "#2563eb",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                },
              }}
            >
              Lưu thông tin
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}

export default UserManagementPage;
