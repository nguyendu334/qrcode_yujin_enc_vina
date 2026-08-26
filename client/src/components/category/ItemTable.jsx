/* eslint-disable react/prop-types */
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

export default function ItemTable({ items, onEdit, onDelete }) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ backgroundColor: "#f8fafc" }}>
          <TableRow>
            <TableCell
              sx={{ fontWeight: "600", color: "#475569", width: "70px" }}
            >
              STT
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
              Hạng mục kiểm tra
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
              Loại
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
              Tiêu chuẩn (Standard)
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
              Đơn vị
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
              Khoảng cho phép (Min - Max)
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: "600", color: "#475569", width: "160px" }}
            >
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow
              key={item.item_id}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                "&:hover": { backgroundColor: "#f8fafc" },
              }}
            >
              <TableCell sx={{ color: "#64748b" }}>{index + 1}</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#1e293b" }}>
                {item.item_name}
              </TableCell>
              <TableCell sx={{ color: "#475569" }}>{item.item_type}</TableCell>
              <TableCell sx={{ color: "#475569" }}>
                {item.standard_value || "—"}
              </TableCell>
              <TableCell sx={{ color: "#475569" }}>
                {item.unit || "—"}
              </TableCell>
              <TableCell sx={{ color: "#475569" }}>
                {item.min_value !== null || item.max_value !== null
                  ? `${item.min_value ?? "—"} ~ ${item.max_value ?? "—"}`
                  : "—"}
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                  <Button
                    size="small"
                    startIcon={
                      <EditOutlinedIcon sx={{ fontSize: "16px !important" }} />
                    }
                    onClick={() => onEdit(item)}
                    sx={{
                      border: "1px solid #e2e8f0",
                      color: "#2563eb",
                      backgroundColor: "#ffffff",
                      textTransform: "none",
                      fontWeight: "600",
                      borderRadius: "6px",
                      px: 1.5,
                      py: 0.5,
                      fontSize: "13px",
                      "&:hover": {
                        backgroundColor: "#eff6ff",
                        borderColor: "#bfdbfe",
                      },
                    }}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    startIcon={
                      <CloseOutlinedIcon sx={{ fontSize: "16px !important" }} />
                    }
                    onClick={() => onDelete(item.item_id)}
                    sx={{
                      border: "1px solid #fee2e2",
                      color: "#ef4444",
                      backgroundColor: "#ffffff",
                      textTransform: "none",
                      fontWeight: "600",
                      borderRadius: "6px",
                      px: 1.5,
                      py: 0.5,
                      fontSize: "13px",
                      "&:hover": {
                        backgroundColor: "#fef2f2",
                        borderColor: "#fca5a5",
                      },
                    }}
                  >
                    Xoá
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}

          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                align="center"
                sx={{ py: 4, color: "#94a3b8" }}
              >
                Chưa có hạng mục kiểm tra nào cho Mẫu này.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
