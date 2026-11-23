import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { useTranslation } from "react-i18next";

// eslint-disable-next-line react/prop-types
export default function HeaderSection({ onOpenAdd, disabled }) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        gap: { xs: 2, sm: 2 },
        mb: 3,
        width: "100%",
      }}
    >
      {/* Tiêu đề */}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#1e293b",
            mb: 0.5,
            fontSize: { xs: "20px", sm: "22px", md: "24px" },
            lineHeight: 1.3,
          }}
        >
          {t("categoryPage.header")}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#64748b",
            fontSize: { xs: "12px", sm: "13px", md: "14px" },
            lineHeight: 1.5,
          }}
        >
          {t("categoryPage.des")}
        </Typography>
      </Box>

      {/* Nút thêm */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onOpenAdd}
        disabled={disabled}
        fullWidth={false}
        sx={{
          backgroundColor: "#4f46e5",
          "&:hover": {
            backgroundColor: "#4338ca",
          },
          "&.Mui-disabled": {
            backgroundColor: "#cbd5e1",
            color: "#fff",
          },
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          px: { xs: 2, sm: 2.5 },
          py: 1,
          minHeight: 42,
          width: { xs: "100%", sm: "auto" },
          maxWidth: { xs: "100%", sm: "190px" },
          flexShrink: 0,
          whiteSpace: "nowrap",
          boxShadow: "none",
        }}
      >
        {t("categoryPage.addCategory")}
      </Button>
    </Box>
  );
}
