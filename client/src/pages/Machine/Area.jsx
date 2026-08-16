import { useState, useEffect } from "react";
import { toast } from "react-toastify";
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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import { useTranslation } from "react-i18next";

import {
  addArea,
  deleteArea,
  getAreas,
  updateArea,
} from "../../services/machineService";

// Dữ liệu mẫu danh sách bộ phận (dùng chọn department_id)
const departmentsList = [
  { department_id: 1, department_name: "Production" },
  { department_id: 2, department_name: "VP" },
  { department_id: 3, department_name: "TECH" },
  { department_id: 4, department_name: "QC" },
  { department_id: 5, department_name: "KHO" },
];

export default function Area() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    area_name: "",
    department_id: "",
  });
  const [errors, setErrors] = useState({});

  const { t } = useTranslation();

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const response = await getAreas();
      const data = response || [];
      setAreas(data);
    } catch (error) {
      console.error("Lỗi gọi API getAreas:", error);
      toast.error("Không thể tải danh sách khu vực từ máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm theo tên khu vực
  const filteredAreas = areas.filter((item) =>
    item.area_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        area_name: item.area_name || "",
        department_id: item.department_id || "",
      });
    } else {
      setEditingItem(null);
      setFormData({ area_name: "", department_id: "" });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.area_name.trim()) {
      newErrors.area_name = "Tên khu vực không được để trống";
    }
    if (!formData.department_id) {
      newErrors.department_id = "Vui lòng chọn bộ phận";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        department_id: Number(formData.department_id),
        area_name: formData.area_name.trim(),
      };

      if (editingItem) {
        // 🌟 Gọi API cập nhật khu vực
        await updateArea(editingItem.area_id, payload);
        toast.success("Cập nhật khu vực thành công!");
      } else {
        // 🌟 Gọi API thêm mới khu vực
        await addArea(payload);
        toast.success("Thêm khu vực mới thành công!");
      }

      // Tải lại danh sách mới nhất từ Database và đóng Modal
      fetchAreas();
      setOpenDialog(false);
    } catch (error) {
      console.error("Lỗi khi lưu khu vực:", error);
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!"
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khu vực này?")) {
      try {
        await deleteArea(id);
        toast.success("Xóa khu vực thành công!");

        // Tải lại danh sách mới nhất từ Database
        fetchAreas();
      } catch (error) {
        console.error("Lỗi khi xóa khu vực:", error);
        toast.error(
          error?.response?.data?.error ||
            "Không thể xóa khu vực, vui lòng thử lại!"
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
            {t("areaPage.header")}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            {t("areaPage.des")}
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
          {t("areaPage.addArea")}
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
          placeholder={t("areaPage.search")}
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
                {t("areaPage.stt")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                {t("areaPage.name")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                {t("areaPage.department")}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, color: "#475569", width: "250px" }}
              >
                {t("areaPage.action")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={32} sx={{ color: "#4f46e5" }} />
                  <Typography variant="body2" sx={{ color: "#64748b", mt: 1 }}>
                    Đang tải dữ liệu khu vực...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredAreas.length > 0 ? (
              filteredAreas.map((row, index) => (
                <TableRow key={row.area_id || index} hover>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, color: "#64748b" }}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {row.area_name}
                  </TableCell>
                  <TableCell sx={{ color: "#64748b" }}>
                    {row.department_name}
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
                      ✏️ {t("areaPage.edit")}
                    </Button>
                    <Button
                      onClick={() => handleDelete(row.area_id)}
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
                      ❌ {t("areaPage.delete")}
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
                  Không tìm thấy khu vực nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Thêm / Sửa */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingItem ? "Chỉnh sửa Khu Vực" : "Thêm Khu Vực Mới"}
        </DialogTitle>

        <DialogContent dividers>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}
          >
            <TextField
              label="Tên khu vực"
              value={formData.area_name}
              onChange={(e) =>
                setFormData({ ...formData, area_name: e.target.value })
              }
              error={Boolean(errors.area_name)}
              helperText={errors.area_name}
              placeholder="VD: SMT, PBA, Văn phòng..."
              fullWidth
              required
            />

            <FormControl
              fullWidth
              error={Boolean(errors.department_id)}
              required
            >
              <InputLabel>Bộ phận</InputLabel>
              <Select
                value={formData.department_id}
                label="Bộ phận"
                onChange={(e) =>
                  setFormData({ ...formData, department_id: e.target.value })
                }
              >
                {departmentsList.map((dept) => (
                  <MenuItem key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
                  </MenuItem>
                ))}
              </Select>
              {errors.department_id && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 1.5 }}
                >
                  {errors.department_id}
                </Typography>
              )}
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
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
