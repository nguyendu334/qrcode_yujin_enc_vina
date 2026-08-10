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
} from "@mui/material";

import { toast } from "react-toastify";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import { getMachineTypes } from "../../services/machineService";

export default function MachineType() {
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    machine_type_name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  // 1. Gọi API lấy danh sách kiểu máy khi component render
  useEffect(() => {
    fetchMachineTypes();
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

  // Tìm kiếm theo tên kiểu máy
  const filteredTypes = deviceTypes.filter((item) =>
    item.machine_type_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        machine_type_name: item.machine_type_name || "",
        description: item.description || "",
      });
    } else {
      setEditingItem(null);
      setFormData({ machine_type_name: "", description: "" });
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (editingItem) {
      // Tùy chỉnh gọi API PUT/PATCH ở đây nếu có
      setDeviceTypes((prev) =>
        prev.map((item) =>
          item.machine_type_id === editingItem.machine_type_id
            ? { ...item, ...formData }
            : item,
        ),
      );
      toast.success("Cập nhật kiểu máy thành công!");
    } else {
      // Tùy chỉnh gọi API POST ở đây nếu có
      const nextId =
        deviceTypes.length > 0
          ? Math.max(...deviceTypes.map((d) => d.machine_type_id)) + 1
          : 1;

      const newItem = {
        machine_type_id: nextId,
        machine_type_name: formData.machine_type_name.trim(),
        description: formData.description.trim(),
      };

      setDeviceTypes([newItem, ...deviceTypes]);
      toast.success("Thêm kiểu máy mới thành công!");
    }

    setOpenDialog(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kiểu máy này?")) {
      // Tùy chỉnh gọi API DELETE ở đây nếu có
      setDeviceTypes((prev) =>
        prev.filter((item) => item.machine_type_id !== id),
      );
      toast.success("Xóa kiểu máy thành công!");
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
            Quản lý Kiểu máy
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Danh sách loại máy/thiết bị trong hệ thống
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
          Thêm kiểu máy
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
          placeholder="Tìm kiếm theo tên kiểu máy..."
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
                STT
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                Tên kiểu máy
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, color: "#475569" }}
              >
                Mô tả
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, color: "#475569", width: "250px" }}
              >
                Thao tác
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
                      ✏️ Sửa
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
                      ❌ Xoá
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
