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
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing={1.5}
      justifyContent="space-between"
      alignItems={{
        xs: "stretch",
        sm: "center",
      }}
      sx={{
        width: "100%",
        minWidth: 0,
        mb: {
          xs: 2,
          sm: 3,
        },
      }}
    >
      {/* SEARCH */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          width: {
            xs: "100%",
            sm: "auto",
          },
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={t("search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            maxWidth: {
              xs: "100%",
              sm: 320,
              md: 380,
            },

            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#fff",
              height: 42,
              fontSize: "0.875rem",
            },
          }}
        />
      </Box>

      {/* ADD MACHINE */}
      <Box
        sx={{
          display: "flex",
          justifyContent: {
            xs: "flex-end",
            sm: "flex-start",
          },
          width: {
            xs: "100%",
            sm: "auto",
          },
          flexShrink: 0,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            height: 42,
            px: 2,
            backgroundColor: "#2563eb",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.875rem",
            textTransform: "none",
            whiteSpace: "nowrap",
            boxShadow: "none",

            "&:hover": {
              backgroundColor: "#1d4ed8",
              boxShadow: "none",
            },

            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          {t("machineTable.addmachine")}
        </Button>
      </Box>
    </Stack>
  );
}
