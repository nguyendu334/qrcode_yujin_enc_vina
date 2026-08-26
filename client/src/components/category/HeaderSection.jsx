import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// eslint-disable-next-line react/prop-types
export default function HeaderSection({ onOpenAdd, disabled }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        mb: 3,
      }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: "700", color: "#1e293b", mb: 0.5 }}
        >
          Quản lý Hạng mục Checksheet
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Danh sách hạng mục tiêu chuẩn kiểm tra theo từng mẫu checksheet
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onOpenAdd}
        disabled={disabled}
        sx={{
          backgroundColor: "#4f46e5",
          "&:hover": { backgroundColor: "#4338ca" },
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: "600",
          px: 2.5,
          py: 1,
          boxShadow: "none",
        }}
      >
        Thêm Hạng Mục
      </Button>
    </Box>
  );
}
