import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: "auto", // Tự động nẩy xuống đáy nếu nội dung trang ngắn
        bgcolor: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        textAlign: "center",
        color: "#64748b",
        width: "100%",
      }}
    >
      <Typography variant="body2" sx={{ fontSize: "13px" }}>
        © {new Date().getFullYear()}. All rights reserved. Designed by
        Nguyen Dinh Du.
      </Typography>
    </Box>
  );
}
