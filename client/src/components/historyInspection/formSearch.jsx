/* eslint-disable react/prop-types */
import { Box, Button, Grid } from "@mui/material";

export default function FormSearch({
  handleSearch,
  t,
  filters,
  setFilters,
  machines,
  handleReset,
}) {
  const fieldStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box",
    fontSize: "14px",
    minHeight: "42px",
    backgroundColor: "#fff",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "6px",
    fontWeight: 500,
  };

  return (
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "background.paper",
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        {/* From date */}
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <label style={labelStyle}>{t("history.fromdate")}</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              style={fieldStyle}
            />
          </Box>
        </Grid>

        {/* To date */}
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <label style={labelStyle}>{t("history.todate")}</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              style={fieldStyle}
            />
          </Box>
        </Grid>

        {/* Machine */}
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <label style={labelStyle}>{t("history.machine")}</label>
            <select
              value={filters.machineId}
              onChange={(e) =>
                setFilters({ ...filters, machineId: e.target.value })
              }
              style={fieldStyle}
            >
              <option value="">{t("history.selectmachine")}</option>
              {machines.map((m) => (
                <option key={m.machine_id} value={m.machine_id}>
                  {m.machine_code} - {m.machine_name}
                </option>
              ))}
            </select>
          </Box>
        </Grid>

        {/* Shift */}
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <label style={labelStyle}>{t("history.shift")}</label>
            <select
              value={filters.shift}
              onChange={(e) =>
                setFilters({ ...filters, shift: e.target.value })
              }
              style={fieldStyle}
            >
              <option value="">{t("history.selectshift")}</option>
              <option value="Ca ngày">{t("shift.Ca ngày")}</option>
              <option value="Ca đêm">{t("shift.Ca đêm")}</option>
            </select>
          </Box>
        </Grid>

        {/* Buttons */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mt: 1,
              width: "100%",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              sx={{
                width: { xs: "100%", sm: "150px" },
                minWidth: "150px",
                py: 1.2,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
                backgroundColor: "#4f46e5",
                "&:hover": {
                  backgroundColor: "#4338ca",
                },
              }}
            >
              {t("history.search")}
            </Button>

            <Button
              type="button"
              onClick={handleReset}
              variant="contained"
              sx={{
                width: { xs: "100%", sm: "150px" },
                minWidth: "150px",
                py: 1.2,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
                backgroundColor: "#6366f1",
                "&:hover": {
                  backgroundColor: "#4f46e5",
                },
              }}
            >
              {t("history.refresh")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
