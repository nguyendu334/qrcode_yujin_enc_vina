import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";

import { toast } from "react-toastify";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import { useTranslation } from "react-i18next";

import {
  addMachineType,
  deleteMachineType,
  getMachineTypes,
  updateMachineType,
} from "../../services/machineService";
import { getUsers } from "../../services/userService"; // Thêm API lấy danh sách người dùng

export default function MachineType() {
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    machine_type_name: "",
    description: "",
    frequency: "DAILY",
    approver_id: "",
  });
  const [errors, setErrors] = useState({});

  const { t } = useTranslation();

  // 1. Gọi API lấy danh sách kiểu máy và danh sách người dùng khi component render
  useEffect(() => {
    fetchMachineTypes();
    fetchUsers();
  }, []);

  const fetchMachineTypes = async () => {
    setLoading(true);
    try {
      const response = await getMachineTypes();
      const data = response;
      setDeviceTypes(data);
    } catch (error) {
      console.error("Lỗi gọi API getMachineTypes:", error);
      toast.error("Lỗi khi tải danh sách kiểu máy. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response?.data || response || []);
    } catch (error) {
      console.error("Lỗi gọi API getUsers:", error);
      toast.error("Lỗi khi tải danh sách người dùng.");
    }
  };

  // Tìm kiếm theo tên kiểu máy
  const filteredTypes = deviceTypes.filter((item) =>
    item.machine_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        machine_type_name: item.machine_type_name || "",
        description: item.description || "",
        frequency: item.frequency || "DAILY",
        approver_id: item.approver_id || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        machine_type_name: "",
        description: "",
        frequency: "DAILY",
        approver_id: "",
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.machine_type_name.trim()) {
      newErrors.machine_type_name = "Tên kiểu máy không được để trống";
    }
    if (!formData.approver_id) {
      newErrors.approver_id = "Vui lòng chọn người duyệt";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        machine_type_name: formData.machine_type_name.trim(),
        description: formData.description.trim(),
        frequency: formData.frequency,
        approver_id: Number(formData.approver_id),
      };

      if (editingItem) {
        // Gọi API Cập nhật
        await updateMachineType(editingItem.machine_type_id, payload);
        toast.success("Cập nhật kiểu máy thành công!");
      } else {
        // 🌟 Gọi API Thêm mới
        await addMachineType(payload);
        toast.success("Thêm kiểu máy mới thành công!");
      }

      // Tải lại danh sách mới nhất từ Database và đóng Modal
      fetchMachineTypes();
      setOpenDialog(false);
    } catch (error) {
      console.error("Lỗi khi lưu kiểu máy:", error);
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!"
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kiểu máy này?")) {
      try {
        await deleteMachineType(id);
        toast.success("Xóa kiểu máy thành công!");

        // Tải lại danh sách mới nhất từ Database
        fetchMachineTypes();
      } catch (error) {
        console.error("Lỗi khi xóa kiểu máy:", error);
        toast.error(
          error?.response?.data?.error ||
            "Không thể xóa kiểu máy, vui lòng thử lại!"
        );
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
          {t("machineType.header")}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          {t("machineType.des")}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            py: 1,
            backgroundColor: "#4f46e5",
            "&:hover": { backgroundColor: "#4338ca" },
          }}
        >
          {t("machineType.addMachineType")}
        </Button>
      </Box>

      {/* Tìm kiếm */}
      <Card
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <TextField
          placeholder={t("machineType.search")}
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: "100%", sm: 360 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      {/* Bảng Dữ Liệu */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, color: "#475569", width: "100px" }}
              >
                {t("machineType.stt")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("machineType.name")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("machineType.approver")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("machineType.frequency")}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, color: "#475569" }}
              >
                {t("machineType.description")}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, color: "#475569", width: "250px" }}
              >
                {t("machineType.action")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={32} sx={{ color: "#4f46e5" }} />
                  <Typography variant="body2" sx={{ color: "#64748b", mt: 1 }}>
                    Đang tải dữ liệu kiểu máy...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredTypes.length > 0 ? (
              filteredTypes.map((row, index) => (
                <TableRow key={row.machine_type_id || index} hover>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, color: "#64748b" }}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {row.machine_type_name}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {row.approver_name || "—"}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {row.frequency || "—"}
                  </TableCell>
                  <TableCell align="center" sx={{ color: "#64748b" }}>
                    {row.description || "—"}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={() => handleOpenDialog(row)}
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
                      ✏️ {t("machineType.edit")}
                    </Button>
                    <Button
                      onClick={() => handleDelete(row.machine_type_id)}
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
                      ❌ {t("machineType.delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ py: 4, color: "#94a3b8" }}
                >
                  Không tìm thấy kiểu máy nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Thêm / Sửa */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingItem ? "Chỉnh sửa Kiểu Máy" : "Thêm Kiểu Máy Mới"}
        </DialogTitle>

        <DialogContent dividers>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}
          >
            <TextField
              label="Tên kiểu máy"
              value={formData.machine_type_name}
              onChange={(e) =>
                setFormData({ ...formData, machine_type_name: e.target.value })
              }
              error={Boolean(errors.machine_type_name)}
              helperText={errors.machine_type_name}
              placeholder="VD: SPI, AOI, PC, Printer..."
              fullWidth
              required
            />

            {/* Tần suất kiểm tra */}
            <FormControl fullWidth required>
              <InputLabel>Tần suất kiểm tra</InputLabel>
              <Select
                value={formData.frequency}
                label="Tần suất kiểm tra"
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
              >
                <MenuItem value="DAILY">DAILY (Hàng ngày)</MenuItem>
                <MenuItem value="WEEKLY">WEEKLY (Hàng tuần)</MenuItem>
                <MenuItem value="MONTHLY">MONTHLY (Hàng tháng)</MenuItem>
              </Select>
            </FormControl>

            {/* Người duyệt */}
            <FormControl fullWidth required error={Boolean(errors.approver_id)}>
              <InputLabel>Người duyệt</InputLabel>
              <Select
                value={formData.approver_id}
                label="Người duyệt"
                onChange={(e) =>
                  setFormData({ ...formData, approver_id: e.target.value })
                }
              >
                {users.map((user) => {
                  const id = user.user_id || user.id;
                  const name =
                    user.full_name ||
                    user.username ||
                    user.name ||
                    `User #${id}`;
                  return (
                    <MenuItem key={id} value={id}>
                      {name}
                    </MenuItem>
                  );
                })}
              </Select>
              {errors.approver_id && (
                <FormHelperText>{errors.approver_id}</FormHelperText>
              )}
            </FormControl>

            <TextField
              label="Mô tả"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Nhập mô tả (nếu có)..."
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ color: "#64748b", textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: "#4f46e5",
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              "&:hover": { backgroundColor: "#4338ca" },
            }}
          >
            Lưu thông tin
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
