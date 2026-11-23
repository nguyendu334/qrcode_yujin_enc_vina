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
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useTranslation } from "react-i18next";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

export default function ItemTable({ items, onEdit, onDelete }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { t } = useTranslation();

  const renderActions = (item) => (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        startIcon={<EditOutlinedIcon sx={{ fontSize: "16px !important" }} />}
        onClick={() => onEdit(item)}
        sx={{
          border: "1px solid #e2e8f0",
          color: "#2563eb",
          backgroundColor: "#ffffff",
          textTransform: "none",
          fontWeight: 600,
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
        {t("edit")}
      </Button>

      <Button
        size="small"
        startIcon={<CloseOutlinedIcon sx={{ fontSize: "16px !important" }} />}
        onClick={() => onDelete(item.item_id)}
        sx={{
          border: "1px solid #fee2e2",
          color: "#ef4444",
          backgroundColor: "#ffffff",
          textTransform: "none",
          fontWeight: 600,
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
        {t("delete")}
      </Button>
    </Stack>
  );

  // Mobile: Hiển thị dạng Card
  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {items.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: "center",
              color: "#94a3b8",
              border: "1px solid #e2e8f0",
              borderRadius: 2,
            }}
          >
            Chưa có hạng mục kiểm tra nào cho Mẫu này.
          </Paper>
        ) : (
          items.map((item, index) => (
            <Card
              key={item.item_id}
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      {t("history.category")} #{index + 1}
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "#1e293b",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.item_name}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: "#eff6ff",
                      color: "#2563eb",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: "11px",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {item.item_type} 
                  </Box>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("categoryPage.standard")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#334155"
                      textAlign="right"
                    >
                      {t(`category_standard_value.${item.standard_value}`) || "--"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("categoryPage.unit")}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {item.unit || "—"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("categoryPage.range")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#334155"
                      textAlign="right"
                    >
                      {item.min_value !== null || item.max_value !== null
                        ? `${item.min_value ?? "—"} ~ ${item.max_value ?? "—"}`
                        : "—"}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  {renderActions(item)}
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    );
  }

  // Desktop: Giữ nguyên dạng bảng
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        overflowX: "auto",
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ backgroundColor: "#f8fafc" }}>
          <TableRow>
            <TableCell
              sx={{ fontWeight: 600, color: "#475569", width: "70px" }}
            >
              {t("categoryPage.stt")}
            </TableCell>

            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("categoryPage.name")}
            </TableCell>

            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("categoryPage.type")}
            </TableCell>

            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("categoryPage.standard")}
            </TableCell>

            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("categoryPage.unit")}
            </TableCell>

            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("categoryPage.range")} (Min ~ Max)
            </TableCell>

            <TableCell
              align="center"
              sx={{ fontWeight: 600, color: "#475569", width: "160px" }}
            >
              {t("categoryPage.action")}
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

              <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                {t(`category.${item.item_name}`) || "N/A"}
              </TableCell>

              <TableCell sx={{ color: "#475569" }}>{item.item_type}</TableCell>

              <TableCell sx={{ color: "#475569" }}>
                {t(`category_standard_value.${item.standard_value}`) || "--"}
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
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    justifyContent: "center",
                  }}
                >
                  {renderActions(item)}
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
