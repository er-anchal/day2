import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Link,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "./AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        form,
      );

      const user = res.data.user;
      const token = res.data.token;

      // Fetch dynamic modules and role access in parallel for instant redirection logic
      const [resModules, resUserAccess, resRoleAccess] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/modules`).catch(() => ({ data: { data: [] } })),
        axios.get(`${import.meta.env.VITE_API_URL}/role-access/${user._id || user.id}`).catch(() => ({ data: null })),
        axios.get(`${import.meta.env.VITE_API_URL}/role-access/role/${user.role}`).catch(() => ({ data: null }))
      ]);

      const allModules = resModules.data?.data || [];
      let moduleAccess = [];
      if (resUserAccess.data && resUserAccess.data.moduleAccess?.length > 0) {
        moduleAccess = resUserAccess.data.moduleAccess;
      } else if (resRoleAccess.data && resRoleAccess.data.moduleAccess) {
        moduleAccess = resRoleAccess.data.moduleAccess;
      }

      const allowedNames = moduleAccess
        .filter((item) => item.permissions?.view)
        .map((item) => item.moduleName.toLowerCase().trim());

      const allowedPathsList = allModules
        .filter((m) => allowedNames.includes(m.name.toLowerCase().trim()))
        .map((m) => m.path?.trim())
        .filter(Boolean);

      // Perform auth login saving
      login(token, user.role);

      // Dynamic redirection
      if (user.role === "SUPER ADMIN") {
        navigate("/templates");
      } else if (allowedPathsList.length > 0) {
        // If they have dashboard access, prioritize /dashboard. Otherwise go to first allowed route
        const preferredPath = allowedPathsList.find(p => p.toLowerCase() === "/dashboard") || allowedPathsList[0];
        navigate(preferredPath);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: {
          xs: "calc(100vh - 56px)",
          sm: "calc(100vh - 64px)",
        },
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, backgroundColor: "background.paper" }} elevation={3}>
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Welcome Back!
          </Typography>

          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Email Field */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Email *
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                variant="outlined"
                size="small"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </Box>

            {/* Password Field */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Password *
              </Typography>
              <TextField
                fullWidth
                name="password"
                type="password"
                variant="outlined"
                size="small"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                fontWeight: 600,
                py: 1.2,
              }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Register Link */}
            <Link
              component={RouterLink}
              to="/register"
              color="inherit"
              underline="hover"
            >
              <Typography
                textAlign="center"
                sx={{ mt: 2 }}
                color="primary"
                fontWeight={500}
              >
                Don’t have an account? Register
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
