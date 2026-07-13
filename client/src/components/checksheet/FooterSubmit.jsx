/* eslint-disable react/prop-types */
import { Button, Box } from "@mui/material";

export default function FooterSubmit({ handleSubmit }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "24px",
      }}
    >
      <Button
        onClick={handleSubmit}
        sx={{
          padding: "12px 32px",
          backgroundColor: "#57b846",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          fontSize: "15px",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(87, 184, 70, 0.25)",
        }}
      >
        Gửi Checksheet
      </Button>
    </Box>
  );
}
