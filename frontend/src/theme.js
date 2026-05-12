// // theme.js
// import { createTheme } from "@mui/material/styles";

// const theme = createTheme({
//   palette: {
//     mode: "light",
//     background: {
//       default: "#f0f2f5", // page background
//       paper: "#f8fafc", // forms/cards
//     },
//     primary: {
//       main: "#28599c", // logo, primary buttons
//       dark: "#303262", // darker accent
//     },
//     secondary: {
//       main: "#ef4444", // error/alert
//     },
//     text: {
//       primary: "#020202", // main text
//       secondary: "#2f2f2f", // secondary text
//     },
//   },
//   typography: {
//     fontFamily: "Roboto, sans-serif",
//   },
//   components: {
//     MuiPaper: {
//       styleOverrides: {
//         root: {
//           borderRadius: 8, // smooth card corners
//         },
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         containedPrimary: {
//           textTransform: "none",
//           fontWeight: 600,
//           padding: "10px 16px",
//         },
//       },
//     },
//   },
// });

// export default theme;

// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    /* ---------------- BACKGROUND ---------------- */
    background: {
      default: "#f1f5f9", // app background (slate-100)
      paper: "#ffffff", // cards / modals
    },

    /* ---------------- PRIMARY ---------------- */
    primary: {
      main: "#28599c", // brand / CTA
      dark: "#1e3a8a", // hover / active
      light: "#4f7fc0",
      contrastText: "#ffffff",
    },

    /* ---------------- SECONDARY ---------------- */
    secondary: {
      main: "#ef4444", // alerts / delete
      dark: "#b91c1c",
      light: "#f87171",
      contrastText: "#ffffff",
    },

    /* ---------------- TEXT ---------------- */
    text: {
      primary: "#0f172a", // slate-900
      secondary: "#475569", // slate-600
      disabled: "#94a3b8", // slate-400
    },

    /* ---------------- DIVIDER / BORDER ---------------- */
    divider: "#e2e8f0",

    /* ---------------- STATUS COLORS ---------------- */
    success: {
      main: "#22c55e",
    },
    warning: {
      main: "#f59e0b",
    },
    error: {
      main: "#ef4444",
    },
    info: {
      main: "#0ea5e9",
    },
  },

  /* ---------------- TYPOGRAPHY ---------------- */
  typography: {
    fontFamily: "Inter, Roboto, system-ui, sans-serif",

    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },

    body1: {
      fontSize: "0.95rem",
    },
    body2: {
      fontSize: "0.85rem",
    },
  },

  /* ---------------- COMPONENT OVERRIDES ---------------- */
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: "1px solid #e2e8f0",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 25,
        },
        containedPrimary: {
          padding: "10px 18px",
          boxShadow: "0 4px 10px rgba(40,89,156,0.25)",
          "&:hover": {
            boxShadow: "0 6px 14px rgba(40,89,156,0.35)",
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          transition: "0.2s ease",
          "&:hover": {
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
  },
});

export default theme;
