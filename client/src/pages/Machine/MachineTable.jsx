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
} from "@mui/material";

import { useTranslation } from "react-i18next";

// eslint-disable-next-line react/prop-types
export default function MachineTable({
  machines,
  loading,
  handleEdit,
  handleDelete,
  exportQR,
}) {
  const { t } = useTranslation();
  if (loading) {
    return <CircularProgress />;
  }
  return (
    <Paper sx={{ borderRadius: 4 }}>
      <Table
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          fontSize: "15px",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell align="center">{t("machineTable.code")}</TableCell>
            <TableCell align="center">{t("machineTable.name")}</TableCell>
            <TableCell align="center">{t("machineTable.area")}</TableCell>
            <TableCell align="center">{t("machineTable.line")}</TableCell>
            <TableCell align="center">{t("machineTable.type")}</TableCell>
            <TableCell align="center">{t("machineTable.active")}</TableCell>
            <TableCell align="center">{t("user.action")}</TableCell>
            <TableCell align="center">{t("machineTable.qrcode")}</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {machines.map((machine) => (
            <TableRow key={machine.machine_id}>
              <TableCell align="center">{machine.machine_code}</TableCell>

              <TableCell align="center">{machine.machine_name}</TableCell>

              <TableCell align="center">
                {t(`area.${machine.area_name}`)}
              </TableCell>

              <TableCell align="center">
                {t(`line.${machine.line_no}`)}
              </TableCell>

              <TableCell align="center">{machine.machine_type_name}</TableCell>

              <TableCell align="center">
                <Chip
                  label={machine.active ? "Active" : "Inactive"}
                  color={machine.active ? "success" : "error"}
                  size="small"
                />
              </TableCell>

              <TableCell align="center">
                <Button
                  onClick={() => handleEdit(machine)}
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
                  ✏️ {t(`edit`)}
                </Button>
                <Button
                  onClick={() => handleDelete(machine)}
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
                  ❌ {t(`delete`)}
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => exportQR(machine)}
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Export QR
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
