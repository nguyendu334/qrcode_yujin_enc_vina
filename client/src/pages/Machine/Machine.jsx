import { Box, Paper, Typography, TablePagination } from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import MachineToolbar from "./MachineToolbar";
import MachineTable from "./MachineTable";
import {
  addMachine,
  deleteMachine,
  getAreas,
  getMachines,
  getMachineTypes,
  updateMachine,
} from "../../services/machineService";
import { useEffect, useState } from "react";
import MachineDialog from "../../components/forms/MachineDialog";
import QRCodeCard from "../../components/forms/QRCodeCard";

export default function MachinePage() {
  const { t } = useTranslation();

  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [areas, setAreas] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedQRMachine, setSelectedQRMachine] = useState(null);

  const fetchMachines = async () => {
    try {
      setLoading(true);

      const data = await getMachines();
      console.log(data)

      setMachines(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    const data = await getAreas();

    setAreas(data);
  };

  const fetchMachineTypes = async () => {
    const data = await getMachineTypes();

    setMachineTypes(data);
  };

  const handleAdd = () => {
    setSelectedMachine(null);
    setOpenDialog(true);
  };

  const handleEdit = (machine) => {
    setSelectedMachine(machine);
    setOpenDialog(true);
  };

  const handleDelete = async (machine) => {
    setSelectedMachine(machine);
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xoá máy ${machine.machine_code} - ${machine.machine_name}?`
      )
    ) {
      try {
        await deleteMachine(machine.machine_id);
        await fetchMachines();
        toast.success("Đã xoá!!!");
      } catch (err) {
        toast.error(err.response?.data?.error || "Không thể xoá thiết bị");
      }
    }
    // setOpenDialog(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedMachine) {
        await updateMachine(selectedMachine.machine_id, formData);

        toast.success("Cập nhật máy thành công");
      } else {
        await addMachine(formData);

        toast.success("Thêm máy thành công");
      }

      setOpenDialog(false);

      fetchMachines();
    } catch (err) {
      toast.error(err.response?.data?.error || "Có lỗi xảy ra");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportQR = async (machine) => {
    if (
      selectedQRMachine &&
      selectedQRMachine.machine_id === machine.machine_id
    ) {
      setSelectedQRMachine(null);
    } else {
      setSelectedQRMachine(machine);
    }
  };

  const keyword = searchTerm.trim().toLowerCase();

  const filteredMachines = machines.filter((m) => {
    return (
      (m.machine_code || "").toLowerCase().includes(keyword) ||
      (m.machine_name || "").toLowerCase().includes(keyword) ||
      (m.line_no || "").toLowerCase().includes(keyword) ||
      (m.area_name || "").toLowerCase().includes(keyword) ||
      (m.machine_type_name || "").toLowerCase().includes(keyword)
    );
  });

  const paginatedMachines = filteredMachines.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  useEffect(() => {
    fetchMachines();
    fetchAreas();
    fetchMachineTypes();
  }, []);

  return (
    <Box sx={{ width: "100%", boxSizing: "border-box" }}>
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 4,
        }}
      >
        <Typography variant="h5">
          {t("machineTable.categorymachine")}
        </Typography>

        <Typography>
          {t("machineTable.manage")}
        </Typography>
      </Paper>

      <MachineToolbar
        handleAdd={handleAdd}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAdd={handleAdd}
      />

      <MachineTable
        machines={paginatedMachines}
        loading={loading}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        exportQR={handleExportQR}
      />

      <TablePagination
        component="div"
        count={filteredMachines.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />

      <Box>
        {selectedQRMachine && <QRCodeCard machine={selectedQRMachine} />}
      </Box>

      <MachineDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        machine={selectedMachine}
        areas={areas}
        machineTypes={machineTypes}
        onSave={handleSave}
      />
    </Box>
  );
}
