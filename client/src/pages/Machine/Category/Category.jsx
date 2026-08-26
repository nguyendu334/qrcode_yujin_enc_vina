import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import api from "../../../helper/api";

export default function Category() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [items, setItems] = useState([]);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    item_name: "",
    item_type: "OKNG",
    standard_value: "",
    unit: "",
    min_value: "",
    max_value: "",
    display_order: 1,
  });

  // Lấy danh sách Templates khi load trang
  useEffect(() => {
    api.get("/checklist-templates").then((res) => {
      const data = res.data.data || res.data;
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplateId(data[0].template_id);
      }
    });
  }, []);

  // Lấy danh sách Items khi chọn Template
  useEffect(() => {
    if (selectedTemplateId) {
      loadTemplateItems(selectedTemplateId);
    }
  }, [selectedTemplateId]);

  const loadTemplateItems = (templateId) => {
    api.get(`/checklist-items/template/${templateId}`).then((res) => {
      setItems(res.data.data || []);
    });
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      item_name: "",
      item_type: "OKNG",
      standard_value: "",
      unit: "",
      min_value: "",
      max_value: "",
      display_order: items.length + 1,
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name || "",
      item_type: item.item_type || "OKNG",
      standard_value: item.standard_value || "",
      unit: item.unit || "",
      min_value: item.min_value !== null ? item.min_value : "",
      max_value: item.max_value !== null ? item.max_value : "",
      display_order: item.display_order || 1,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!formData.item_name) {
      alert("Vui lòng nhập Tên hạng mục!");
      return;
    }

    if (editingItem) {
      await api.put(`/checklist-items/${editingItem.item_id}`, formData);
    } else {
      await api.post("/checklist-items", {
        ...formData,
        template_id: selectedTemplateId,
      });
    }

    setOpenModal(false);
    loadTemplateItems(selectedTemplateId);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hạng mục này?")) {
      await api.delete(`/checklist-items/${itemId}`);
      loadTemplateItems(selectedTemplateId);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: "bold", color: "#1e293b" }}
      >
        Quản lý Hạng mục Checksheet
      </Typography>

      {/* CHỌN TEMPLATE & BUTTON THÊM */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <FormControl sx={{ minWidth: 300, backgroundColor: "#fff" }}>
          <InputLabel>Chọn Mẫu Checksheet</InputLabel>
          <Select
            value={selectedTemplateId}
            label="Chọn Mẫu Checksheet"
            onChange={(e) => setSelectedTemplateId(e.target.value)}
          >
            {templates.map((tpl) => (
              <MenuItem key={tpl.template_id} value={tpl.template_id}>
                {tpl.template_name || `Template #${tpl.template_id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          disabled={!selectedTemplateId}
          sx={{ backgroundColor: "#2563eb", height: "56px" }}
        >
          Thêm Hạng Mục
        </Button>
      </Box>

      {/* BẢNG HIỂN THỊ */}
      <TableContainer component={Paper} sx={{ borderRadius: "8px" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f1f5f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "60px" }}>
                STT
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Hạng mục kiểm tra
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Loại</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Tiêu chuẩn (Standard)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Đơn vị</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Khoảng cho phép (Min - Max)
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", width: "100px", textAlign: "center" }}
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.item_id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell sx={{ fontWeight: "600" }}>
                  {item.item_name}
                </TableCell>
                <TableCell>{item.item_type}</TableCell>
                <TableCell>{item.standard_value || "-"}</TableCell>
                <TableCell>{item.unit || "-"}</TableCell>
                <TableCell>
                  {item.min_value !== null || item.max_value !== null
                    ? `${item.min_value ?? "-"} ~ ${item.max_value ?? "-"}`
                    : "-"}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenEdit(item)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(item.item_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ py: 3, color: "#64748b" }}
                >
                  Chưa có hạng mục kiểm tra nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* FORM MODAL THÊM / SỬA */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editingItem ? "Sửa Hạng Mục" : "Thêm Hạng Mục Mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Thứ tự hiển thị (display_order)"
              type="number"
              value={formData.display_order}
              onChange={(e) =>
                setFormData({ ...formData, display_order: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Tên hạng mục (item_name)"
              value={formData.item_name}
              onChange={(e) =>
                setFormData({ ...formData, item_name: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="item-type-label">
                Loại kiểm tra (item_type)
              </InputLabel>
              <Select
                labelId="item-type-label"
                value={formData.item_type}
                label="Loại kiểm tra (item_type)"
                onChange={(e) =>
                  setFormData({ ...formData, item_type: e.target.value })
                }
              >
                <MenuItem value="OKNG">OK / NG</MenuItem>
                <MenuItem value="NUMBER">Nhập số (NUMBER)</MenuItem>
                <MenuItem value="TEXT">Văn bản (TEXT)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Mô tả Tiêu chuẩn (standard_value)"
              value={formData.standard_value}
              onChange={(e) =>
                setFormData({ ...formData, standard_value: e.target.value })
              }
              multiline
              rows={2}
              fullWidth
            />

            {/* Chỉ hiện Min/Max/Unit khi loại kiểm tra là NUMBER */}
            {formData.item_type === "NUMBER" && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Đơn vị (unit)"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Giá trị Min"
                  type="number"
                  value={formData.min_value}
                  onChange={(e) =>
                    setFormData({ ...formData, min_value: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Giá trị Max"
                  type="number"
                  value={formData.max_value}
                  onChange={(e) =>
                    setFormData({ ...formData, max_value: e.target.value })
                  }
                  fullWidth
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingItem ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
