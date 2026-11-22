/* eslint-disable react/prop-types */

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Chip,
  Button,
  TableContainer,
  Box,
} from "@mui/material";

import { useTranslation } from "react-i18next";

export default function MachineTable({
  machines,
  loading,
  handleEdit,
  handleDelete,
  exportQR,
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 5,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        minWidth: 0,
        borderRadius: { xs: 2, sm: 3 },
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      {/* TABLE CONTAINER */}
      <TableContainer
        sx={{
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",

          "&::-webkit-scrollbar": {
            height: 7,
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: 10,
          },

          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f5f9",
          },
        }}
      >
        <Table
          stickyHeader
          sx={{
            minWidth: {
              xs: 1100,
              sm: 1200,
              md: 1300,
            },
            borderCollapse: "separate",
            borderSpacing: 0,

            "& .MuiTableCell-root": {
              px: {
                xs: 1.5,
                sm: 2,
              },
              py: {
                xs: 1.8,
                sm: 2,
              },
              fontSize: {
                xs: "0.78rem",
                sm: "0.875rem",
              },
              borderBottom: "1px solid #e2e8f0",
            },
          }}
        >
          {/* HEADER */}
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>{t("machineTable.code")}</TableCell>

              <TableCell sx={headerStyle}>{t("machineTable.name")}</TableCell>

              <TableCell align="center" sx={headerStyle}>
                {t("machineTable.area")}
              </TableCell>

              <TableCell align="center" sx={headerStyle}>
                {t("machineTable.line")}
              </TableCell>

              <TableCell align="center" sx={headerStyle}>
                {t("machineTable.type")}
              </TableCell>

              <TableCell align="center" sx={headerStyle}>
                {t("machineTable.admin")}
              </TableCell>

              <TableCell align="center" sx={headerStyle}>
                {t("machineTable.active")}
              </TableCell>

              <TableCell align="center" sx={headerStyle}>
                {t("user.action")}
              </TableCell>

              <TableCell align="center" sx={headerStyle}>
                {t("machineTable.qrcode")}
              </TableCell>
            </TableRow>
          </TableHead>

          {/* BODY */}
          <TableBody>
            {machines.map((machine) => (
              <TableRow
                key={machine.machine_id}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                  },
                  transition: "background-color 0.2s",
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>
                  {machine.machine_code}
                </TableCell>

                <TableCell
                  sx={{
                    minWidth: 180,
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                  }}
                >
                  {machine.machine_name}
                </TableCell>

                <TableCell align="center">
                  {t(`area.${machine.area_name}`)}
                </TableCell>

                <TableCell align="center">
                  {t(`line.${machine.line_no}`)}
                </TableCell>

                <TableCell align="center">
                  {machine.machine_type_name}
                </TableCell>

                <TableCell align="center">
                  {machine.approver_name || "—"}
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={machine.active ? "Active" : "Inactive"}
                    color={machine.active ? "success" : "error"}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      minWidth: 75,
                    }}
                  />
                </TableCell>

                {/* ACTIONS */}
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <Button
                      onClick={() => handleEdit(machine)}
                      variant="outlined"
                      size="small"
                      sx={{
                        minWidth: 85,
                        textTransform: "none",
                        borderRadius: 1.5,
                        color: "#2563eb",
                        borderColor: "#bfdbfe",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          backgroundColor: "#eff6ff",
                          borderColor: "#3b82f6",
                        },
                      }}
                    >
                      ✏️ {t("edit")}
                    </Button>

                    <Button
                      onClick={() => handleDelete(machine)}
                      variant="outlined"
                      size="small"
                      sx={{
                        minWidth: 85,
                        textTransform: "none",
                        borderRadius: 1.5,
                        color: "#dc2626",
                        borderColor: "#fecaca",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          backgroundColor: "#fef2f2",
                          borderColor: "#ef4444",
                        },
                      }}
                    >
                      ❌ {t("delete")}
                    </Button>
                  </Box>
                </TableCell>

                {/* EXPORT QR */}
                <TableCell align="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => exportQR(machine)}
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 1.5,
                      whiteSpace: "nowrap",
                      boxShadow: "none",
                    }}
                  >
                    Export QR
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {machines.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{
                    py: 5,
                    color: "#94a3b8",
                  }}
                >
                  Không có dữ liệu máy móc.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MOBILE SCROLL HINT */}
      <Box
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
          px: 2,
          py: 1,
          backgroundColor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          color: "#64748b",
          fontSize: "0.72rem",
          textAlign: "center",
        }}
      >
        ← Vuốt ngang để xem thêm thông tin →
      </Box>
    </Paper>
  );
}

const headerStyle = {
  backgroundColor: "#f8fafc",
  color: "#475569",
  fontWeight: 700,
  whiteSpace: "nowrap",
  py: 2,
};
