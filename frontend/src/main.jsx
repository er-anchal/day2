import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";

import App from "./App.jsx";
import "./index.css";
import theme from "./theme.js";

import { AuthProvider } from "./pages/auth/AuthContext.jsx";
import { ThemeProvider as CustomThemeProvider } from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CustomThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
