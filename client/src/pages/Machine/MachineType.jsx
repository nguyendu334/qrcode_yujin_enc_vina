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
  Stack,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";

import { toast } from "react-toastify";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

import {
  addMachineType,
  deleteMachineType,
  getMachineTypes,
  updateMachineType,
} from "../../services/machineService";

import { getUsers } from "../../services/userService";

export default function MachineType() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  useEffect(() => {
    fetchMachineTypes();
    fetchUsers();
  }, []);

  const fetchMachineTypes = async () => {
    setLoading(true);

    try {
      const response = await getMachineTypes();
      setDeviceTypes(response || []);
    } catch (error) {
      console.error("Lỗi gọi API getMachineTypes:", error);
      toast.error("Lỗi khi tải danh sách kiểu máy.");
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
        await updateMachineType(editingItem.machine_type_id, payload);

        toast.success("Cập nhật kiểu máy thành công!");
      } else {
        await addMachineType(payload);

        toast.success("Thêm kiểu máy mới thành công!");
      }

      setOpenDialog(false);
      fetchMachineTypes();
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

  const frequencyLabel = (frequency) => {
    const labels = {
      DAILY: "DAILY",
      WEEKLY: "WEEKLY",
      MONTHLY: "MONTHLY",
    };

    return labels[frequency] || frequency || "—";
  };

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
            {t("machineType.header")}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mt: 0.5,
            }}
          >
            {t("machineType.des")}
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth={isMobile}
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            py: 1,
            minWidth: { sm: 100 },
            maxWidth: { sm: 220 },
            flexShrink: 0,
            alignSelf: { xs: "stretch", sm: "center" },
            backgroundColor: "#4f46e5",
            whiteSpace: "nowrap",
            "&:hover": {
              backgroundColor: "#4338ca",
            },
          }}
        >
          {t("machineType.addMachineType")}
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
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <TextField
          fullWidth
          placeholder={t("machineType.search")}
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            maxWidth: { sm: 400 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#fff",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      {/* LOADING */}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress sx={{ color: "#4f46e5" }} />
        </Box>
      ) : filteredTypes.length === 0 ? (
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
            Không tìm thấy kiểu máy nào.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* MOBILE CARD */}

          {isMobile ? (
            <Stack spacing={2}>
              {filteredTypes.map((row, index) => (
                <Card
                  key={row.machine_type_id || index}
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
                          sx={{
                            color: "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          #{index + 1} · MACHINE TYPE
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
                          {row.machine_type_name}
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={frequencyLabel(row.frequency)}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t("machineType.approver")}
                        </Typography>

                        <Typography
                          fontWeight={600}
                          fontSize={14}
                          sx={{ overflowWrap: "anywhere" }}
                        >
                          {row.approver_name || "—"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t("machineType.description")}
                        </Typography>

                        <Typography
                          fontSize={14}
                          color="#475569"
                          sx={{
                            overflowWrap: "anywhere",
                          }}
                        >
                          {row.description || "—"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Divider />

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      p: 1.5,
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => handleOpenDialog(row)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                      }}
                    >
                      {t("machineType.edit")}
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlinedIcon />}
                      onClick={() => handleDelete(row.machine_type_id)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                      }}
                    >
                      {t("machineType.delete")}
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
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflowX: "auto",
              }}
            >
              <Table sx={{ minWidth: 850 }}>
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "#475569",
                        width: 70,
                      }}
                    >
                      {t("machineType.stt")}
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      {t("machineType.name")}
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      {t("machineType.approver")}
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      {t("machineType.frequency")}
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      {t("machineType.description")}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        width: 230,
                      }}
                    >
                      {t("machineType.action")}
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredTypes.map((row, index) => (
                    <TableRow key={row.machine_type_id || index} hover>
                      <TableCell align="center" sx={{ color: "#64748b" }}>
                        {index + 1}
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600 }}>
                        {row.machine_type_name}
                      </TableCell>

                      <TableCell>{row.approver_name || "—"}</TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={frequencyLabel(row.frequency)}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          color: "#64748b",
                          maxWidth: 250,
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {row.description || "—"}
                      </TableCell>

                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditOutlinedIcon />}
                            onClick={() => handleOpenDialog(row)}
                            sx={{ textTransform: "none" }}
                          >
                            {t("machineType.edit")}
                          </Button>

                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<DeleteOutlinedIcon />}
                            onClick={() => handleDelete(row.machine_type_id)}
                            sx={{ textTransform: "none" }}
                          >
                            {t("machineType.delete")}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* ADD / EDIT DIALOG */}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
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
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            fontSize: 20,
            p: { xs: 2, sm: 3 },
          }}
        >
          {editingItem ? "Chỉnh sửa Kiểu Máy" : "Thêm Kiểu Máy Mới"}

          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              pt: 1,
            }}
          >
            <TextField
              label="Tên kiểu máy"
              value={formData.machine_type_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  machine_type_name: e.target.value,
                })
              }
              error={Boolean(errors.machine_type_name)}
              helperText={errors.machine_type_name}
              placeholder="VD: SPI, AOI, PC, Printer..."
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Tần suất kiểm tra</InputLabel>

              <Select
                value={formData.frequency}
                label="Tần suất kiểm tra"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frequency: e.target.value,
                  })
                }
              >
                <MenuItem value="DAILY">DAILY (Hàng ngày)</MenuItem>

                <MenuItem value="WEEKLY">WEEKLY (Hàng tuần)</MenuItem>

                <MenuItem value="MONTHLY">MONTHLY (Hàng tháng)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required error={Boolean(errors.approver_id)}>
              <InputLabel>Người duyệt</InputLabel>

              <Select
                value={formData.approver_id}
                label="Người duyệt"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    approver_id: e.target.value,
                  })
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
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Nhập mô tả (nếu có)..."
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: "#4f46e5",
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              "&:hover": {
                backgroundColor: "#4338ca",
              },
            }}
          >
            Lưu thông tin
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
