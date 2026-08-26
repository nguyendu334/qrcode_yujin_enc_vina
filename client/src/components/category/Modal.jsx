/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

export default function ItemModal({
  open,
  isEditing,
  formData,
  setFormData,
  onClose,
  onSave,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "10px", p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: "700", color: "#1e293b", pb: 1 }}>
        {isEditing ? "Sửa Hạng Mục Checksheet" : "Thêm Hạng Mục Mới"}
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: "#f1f5f9" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Thứ tự hiển thị (display_order)"
            type="number"
            size="small"
            value={formData.display_order}
            onChange={(e) =>
              setFormData({ ...formData, display_order: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Tên hạng mục (item_name)"
            size="small"
            value={formData.item_name}
            onChange={(e) =>
              setFormData({ ...formData, item_name: e.target.value })
            }
            fullWidth
          />
          <FormControl fullWidth size="small">
            <InputLabel id="modal-item-type-label">
              Loại kiểm tra
            </InputLabel>
            <Select
              labelId="modal-item-type-label"
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
            size="small"
            value={formData.standard_value}
            onChange={(e) =>
              setFormData({ ...formData, standard_value: e.target.value })
            }
            multiline
            rows={2}
            fullWidth
          />

          {formData.item_type === "NUMBER" && (
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <TextField
                label="Đơn vị (unit)"
                size="small"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Giá trị Min"
                type="number"
                size="small"
                value={formData.min_value}
                onChange={(e) =>
                  setFormData({ ...formData, min_value: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Giá trị Max"
                type="number"
                size="small"
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
      <DialogActions sx={{ pt: 2 }}>
        <Button
          onClick={onClose}
          sx={{ color: "#64748b", textTransform: "none", fontWeight: "600" }}
        >
          Hủy
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          sx={{
            backgroundColor: "#4f46e5",
            "&:hover": { backgroundColor: "#4338ca" },
            borderRadius: "6px",
            textTransform: "none",
            fontWeight: "600",
            boxShadow: "none",
          }}
        >
          {isEditing ? "Cập nhật" : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
