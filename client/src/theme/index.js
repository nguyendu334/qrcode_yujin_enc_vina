import { createTheme } from "@mui/material/styles";

import colors from "./colors";
import typography from "./typography";
import components from "./components";

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
    },

    secondary: {
      main: colors.secondary,
    },

    success: {
      main: colors.success,
    },

    warning: {
      main: colors.warning,
    },

    error: {
      main: colors.error,
    },

    background: {
      default: colors.background,

      paper: colors.card,
    },
  },

  typography,

  components,
});

export default theme;
