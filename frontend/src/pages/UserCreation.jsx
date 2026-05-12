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

const UserCreation = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        px: 4,
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{ p: 4, mt: 6, backgroundColor: "background.paper" }}
          elevation={3}
        >
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Create User
          </Typography>

          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Name */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Name *
              </Typography>
              <TextField
                fullWidth
                name="name"
                variant="outlined"
                size="small"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </Box>

            {/* Phone Number */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Phone Number *
              </Typography>
              <TextField
                fullWidth
                name="phone"
                type="tel"
                variant="outlined"
                size="small"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                inputProps={{
                  maxLength: 10,
                  pattern: "[0-9]{10}",
                }}
                required
              />
            </Box>

            {/* Email */}
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
                required
              />
            </Box>

            {/* Password */}
            <Box sx={{ mb: 2 }}>
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
                required
              />
            </Box>

            {/* Confirm Password */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Confirm Password *
              </Typography>
              <TextField
                fullWidth
                name="confirmPassword"
                type="password"
                variant="outlined"
                size="small"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
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
              {loading ? "Creating Account..." : "Register"}
            </Button>

            {/* Login Link */}
            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
              color="inherit"
            ></Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserCreation;
