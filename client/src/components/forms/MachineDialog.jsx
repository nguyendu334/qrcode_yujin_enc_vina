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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
      setForm({
        ...machine,
        machine_type_id: machine.machine_type_id ?? "",
        area_id: machine.area_id ?? "",
      });
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
  }, [machine, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: {
            xs: 0,
            sm: 3,
          },
          overflow: "hidden",
          width: "100%",
          maxHeight: {
            xs: "100%",
            sm: "calc(100% - 64px)",
          },
        },
      }}
    >
      {/* HEADER */}

      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            bgcolor: "#4F46E5",
            color: "#fff",
            px: {
              xs: 2,
              sm: 3,
            },
            py: {
              xs: 2,
              sm: 2.5,
            },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: 20,
                  sm: 25,
                  md: 28,
                },
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {machine ? "Cập nhật thiết bị" : "Thêm thiết bị"}
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: 12,
                  sm: 13,
                },
                mt: 0.5,
                opacity: 0.9,
              }}
            >
              Nhập thông tin thiết bị
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              flexShrink: 0,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.15)",
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* FORM CONTENT */}

      <DialogContent
        sx={{
          px: {
            xs: 2,
            sm: 3,
          },
          py: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Divider sx={{ mb: 2.5 }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* MACHINE CODE */}

          <Typography fontWeight={600} fontSize={14} mb={1} color="#334155">
            Mã máy *
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Ví dụ: AC001"
            name="machine_code"
            value={form.machine_code || ""}
            onChange={handleChange}
            sx={{ mb: 2.5 }}
          />

          {/* MACHINE NAME */}

          <Typography fontWeight={600} fontSize={14} mb={1} color="#334155">
            Tên máy *
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Ví dụ: Air Cooling 01"
            name="machine_name"
            value={form.machine_name || ""}
            onChange={handleChange}
            sx={{ mb: 2.5 }}
          />

          {/* MACHINE TYPE */}

          <Typography fontWeight={600} fontSize={14} mb={1} color="#334155">
            Loại máy *
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            name="machine_type_id"
            value={form.machine_type_id || ""}
            onChange={handleChange}
            sx={{ mb: 2.5 }}
          >
            {areas &&
              machineTypes.map((m) => (
                <MenuItem key={m.machine_type_id} value={m.machine_type_id}>
                  {m.machine_type_name}
                </MenuItem>
              ))}
          </TextField>

          {/* AREA */}

          <Typography fontWeight={600} fontSize={14} mb={1} color="#334155">
            Khu vực *
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            name="area_id"
            value={form.area_id || ""}
            onChange={handleChange}
            sx={{ mb: 2.5 }}
          >
            {areas.map((a) => (
              <MenuItem key={a.area_id} value={a.area_id}>
                {a.area_name}
              </MenuItem>
            ))}
          </TextField>

          {/* LINE */}

          <Typography fontWeight={600} fontSize={14} mb={1} color="#334155">
            Line
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Ví dụ: SMT"
            name="line_no"
            value={form.line_no || ""}
            onChange={handleChange}
            sx={{ mb: 2.5 }}
          />

          {/* ACTIVE STATUS */}

          <Box
            sx={{
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            <FormControlLabel
              sx={{
                width: "100%",
                justifyContent: "space-between",
                m: 0,
              }}
              label={
                <Typography fontWeight={600} fontSize={14} color="#334155">
                  Máy đang hoạt động
                </Typography>
              }
              labelPlacement="start"
              control={
                <Switch
                  checked={Boolean(form.active)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  color="success"
                />
              }
            />
          </Box>
        </Box>
      </DialogContent>

      {/* ACTIONS */}

      <DialogActions
        sx={{
          px: {
            xs: 2,
            sm: 3,
          },
          py: {
            xs: 2,
            sm: 2.5,
          },
          borderTop: "1px solid #eee",
          gap: 1,
          flexDirection: "row",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            flex: 1,
            height: 42,
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Huỷ
        </Button>

        <Button
          variant="contained"
          startIcon={<Save />}
          sx={{
            flex: 1,
            height: 42,
            bgcolor: "#4F46E5",
            textTransform: "none",
            borderRadius: 2,
            "&:hover": {
              bgcolor: "#4338CA",
            },
          }}
          onClick={handleSubmit}
        >
          Lưu thiết bị
        </Button>
      </DialogActions>
    </Dialog>
  );
}
