/* eslint-disable react/prop-types */
import { Box, Button } from "@mui/material";

export default function FormSearch({
  handleSearch,
  t,
  filters,
  setFilters,
  machines,
  handleReset,
}) {
  return (
    <form
      onSubmit={handleSearch}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px 40px",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <Box>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            color: "#64748b",
            marginBottom: "6px",
          }}
        >
          {t(`history.fromdate`)}
        </label>
        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxSizing: "border-box",
          }}
        />
      </Box>
      <Box>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            color: "#64748b",
            marginBottom: "6px",
          }}
        >
          {t(`history.todate`)}
        </label>
        <input
          type="date"
          value={filters.toDate}
          onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxSizing: "border-box",
          }}
        />
      </Box>
      <Box>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            color: "#64748b",
            marginBottom: "6px",
          }}
        >
          {t(`history.machine`)}
        </label>
        <select
          value={filters.machineId}
          onChange={(e) =>
            setFilters({ ...filters, machineId: e.target.value })
          }
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
            boxSizing: "border-box",
          }}
        >
          <option value="">{t(`history.selectmachine`)}</option>
          {machines.map((m) => (
            <option key={m.machine_id} value={m.machine_id}>
              {m.machine_code} - {m.machine_name}
            </option>
          ))}
        </select>
      </Box>
      <Box>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            color: "#64748b",
            marginBottom: "6px",
          }}
        >
          {t(`history.shift`)}
        </label>
        <select
          value={filters.shift}
          onChange={(e) => setFilters({ ...filters, shift: e.target.value })}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
            boxSizing: "border-box",
          }}
        >
          <option value="">{t(`history.selectshift`)}</option>
          <option value="Ca ngày">{t(`shift.Ca ngày`)}</option>
          <option value="Ca đêm">{t(`shift.Ca đêm`)}</option>
        </select>
      </Box>
      <Box
        style={{
          gridColumn: "span 2",
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginTop: "10px",
        }}
      >
        <Button
          type="submit"
          sx={{
            background: "#4f46e5",
            color: "#fff",
            padding: "10px 32px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {t(`history.search`)}
        </Button>
        <Button
          type="button"
          onClick={handleReset}
          sx={{
            background: "#6366f1",
            color: "#fff",
            padding: "10px 32px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {t(`history.refresh`)}
        </Button>
      </Box>
    </form>
  );
}
