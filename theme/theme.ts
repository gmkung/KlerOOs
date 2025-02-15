import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#9C27B0", // Kleros purple
    },
    secondary: {
      main: "#FF69B4", // Pink
    },
    warning: {
      main: "#B7832F", // Purple-tinged orange
    },
    error: {
      main: "#B32F5B", // Purple-tinged red
    },
    success: {
      main: "#9E9E9E", // Grey purple for finalized
    },
    info: {
      main: "#C5A3A3", // Grey-pink
    },
  },
});
