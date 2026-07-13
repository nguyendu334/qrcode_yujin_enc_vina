/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Divider,
  IconButton,
} from "@mui/material";

import { Close, Save } from "@mui/icons-material";

export default function MachineDialog({
  open,
  onClose,
  machine,
  areas,
  machineTypes,
  onSave,
}) {
  const [form, setForm] = useState({
    machine_code: "",
    machine_name: "",
    machine_type_id: "",
    area_id: "",
    line_no: "",
    active: true,
  });

  useEffect(() => {
    if (machine) {
      setForm(machine);
    } else {
      setForm({
        machine_code: "",
        machine_name: "",
        area_id: "",
        line_no: "",
        machine_type_id: "",
        active: true,
      });
    }
  }, [machine]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            bgcolor: "#4F46E5",
            color: "#fff",
            px: 4,
            py: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" gap={2} alignItems="center">
            {/* <PrecisionManufacturing fontSize="large" /> */}

            <Box>
              <Typography sx={{ fontSize: "32px", fontWeight: "700" }}>
                {machine ? "Cập nhật thiết bị" : "Thêm thiết bị"}
              </Typography>

              <Typography fontSize={13}>Nhập thông tin thiết bị</Typography>
            </Box>
          </Box>

          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Divider sx={{ mb: 3 }} />

        <Typography mb={1}>Mã máy *</Typography>

        <TextField
          fullWidth
          placeholder="Ví dụ: AC001"
          name="machine_code"
          value={form.machine_code}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <Typography mb={1}>Tên máy *</Typography>

        <TextField
          fullWidth
          placeholder="Ví dụ: Air Cooling 01"
          name="machine_name"
          value={form.machine_name}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <Typography mb={1}>Loại máy *</Typography>

        <TextField
          select
          fullWidth
          name="machine_type_id"
          value={form.machine_type_id}
          onChange={handleChange}
          sx={{ mb: 2 }}
        >
          {machineTypes.map((m) => (
            <MenuItem key={m.machine_type_id} value={m.machine_type_id}>
              {m.machine_type_name}
            </MenuItem>
          ))}
        </TextField>

        <Typography mb={1}>Khu vực *</Typography>

        <TextField
          select
          fullWidth
          name="area_id"
          value={form.area_id}
          onChange={handleChange}
          sx={{ mb: 2 }}
        >
          {areas.map((a) => (
            <MenuItem key={a.area_id} value={a.area_id}>
              {a.area_name}
            </MenuItem>
          ))}
        </TextField>

        <Typography mb={1}>Line</Typography>

        <TextField
          fullWidth
          name="line_no"
          value={form.line_no}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            bgcolor: "#F8FAFC",
            borderRadius: 2,
            p: 2,
          }}
        >
          <FormControlLabel
            label="Máy đang hoạt động"
            control={
              <Switch
                checked={form.active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    active: e.target.checked,
                  })
                }
              />
            }
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          py: 3,
          borderTop: "1px solid #eee",
        }}
      >
        <Button onClick={onClose} variant="outlined" size="large">
          Huỷ
        </Button>

        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          sx={{
            px: 4,
            bgcolor: "#4F46E5",
          }}
          onClick={() => onSave(form)}
        >
          Lưu thiết bị
        </Button>
      </DialogActions>
    </Dialog>
  );
}
