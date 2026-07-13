/* eslint-disable react/prop-types */
import { Card, CardContent, Typography, Box } from "@mui/material";

export default function DashboardCard({ title, value, color, icon }) {
  return (
    <Card
      sx={{
        height: 140,

        borderRadius: 4,

        transition: ".25s",

        cursor: "pointer",

        "&:hover": {
          transform: "translateY(-6px)",

          boxShadow: 8,
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          {icon}

          <Typography color="text.secondary">Today</Typography>
        </Box>

        <Typography mt={3} color="text.secondary">
          {title}
        </Typography>

        <Typography fontWeight={700} fontSize={40} color={color}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
