/* eslint-disable react/prop-types */
import {
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function TemplateFilter({
  templates,
  selectedTemplateId,
  onChange,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
      }}
    >
      <FormControl size="small" sx={{ minWidth: 300 }}>
        <InputLabel id="select-template-label">Chọn Mẫu Checksheet</InputLabel>
        <Select
          labelId="select-template-label"
          value={selectedTemplateId}
          label="Chọn Mẫu Checksheet"
          onChange={(e) => onChange(e.target.value)}
          sx={{ borderRadius: "6px" }}
        >
          {templates.map((tpl) => (
            <MenuItem key={tpl.template_id} value={tpl.template_id}>
              {tpl.template_name || `Template #${tpl.template_id}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
}
