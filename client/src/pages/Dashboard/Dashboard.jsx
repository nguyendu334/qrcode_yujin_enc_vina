import { Grid } from "@mui/material";

import DashboardCard from "./DashboardCard";

import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function Dashboard() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} lg={3}>
        <DashboardCard
          title="Machines"
          value={25}
          color="#4f46e5"
          icon={<PrecisionManufacturingIcon sx={{ fontSize: 42 }} />}
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <DashboardCard
          title="Today's Check"
          value={132}
          color="#0ea5e9"
          icon={<FactCheckIcon sx={{ fontSize: 42 }} />}
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <DashboardCard
          title="NG"
          value={3}
          color="#ef4444"
          icon={<ErrorIcon sx={{ fontSize: 42 }} />}
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <DashboardCard
          title="Completion"
          value="98%"
          color="#22c55e"
          icon={<CheckCircleIcon sx={{ fontSize: 42 }} />}
        />
      </Grid>
    </Grid>
  );
}
