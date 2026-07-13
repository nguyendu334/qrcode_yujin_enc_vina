/* eslint-disable react/prop-types */
import { Stack, TextField, Button, Box } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

export default function MachineToolbar({
  searchTerm,
  setSearchTerm,
  handleAdd,
}) {
  const { t } = useTranslation();
  return (
    <Stack
      direction="row"
      spacing={147}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Stack direction="row">
        <TextField
          size="small"
          placeholder= {t(`search`)} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            padding: "6px 12px",
            borderRadius: "6px",
          }}
        />

        {/* <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="text"
          placeholder="Search..."
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        /> */}

        {/* <TextField size="small" select sx={{ width: 180 }}>
          <MenuItem value="">Tất cả loại máy</MenuItem>
        </TextField> */}
      </Stack>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Button
          sx={{
            height: "42px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 8px",
            borderRadius: "6px",
          }}
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          {t(`machineTable.addmachine`)}
        </Button>
      </Box>
    </Stack>
  );
}
