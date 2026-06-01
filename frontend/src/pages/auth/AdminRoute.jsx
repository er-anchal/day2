import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Box, CircularProgress } from "@mui/material";

export default function AdminRoute({ children }) {
  const { user, allowedPaths, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "#c6ff00" }} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // SUPER ADMIN has bypass access to all routes to avoid configuration deadlocks
  if (user.role === "SUPER ADMIN") {
    return children;
  }

  // Allow all authorized administrators to access the CAD Catalog configurator page
  const cleanPath = location.pathname.toLowerCase().trim();
  if (cleanPath === "/admin/jewellery-configurator" && (user.role === "ADMIN" || user.role === "SUPER ADMIN")) {
    return children;
  }

  // Verify route access against dynamic permissions matrix
  const isAllowed = allowedPaths.some((modPath) => {
    const currentPath = location.pathname.toLowerCase().trim();
    return currentPath === modPath || currentPath.startsWith(modPath + "/");
  });

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}

