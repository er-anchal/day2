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
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
    dob: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dobError, setDobError] = useState("");

  // Max allowed DOB = yesterday (must be born before today)
  const today = new Date();
  const maxDob = new Date(today);
  maxDob.setDate(today.getDate() - 1);
  const maxDobStr = maxDob.toISOString().split("T")[0]; // yyyy-mm-dd
  const currentYear = today.getFullYear();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      setDobError("");
      if (value) {
        const year = parseInt(value.split("-")[0], 10);
        if (year >= currentYear) {
          setDobError(`Birth year must be less than ${currentYear}.`);
          return;
        }
      }
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (form.dob) {
      const year = parseInt(form.dob.split("-")[0], 10);
      if (year >= currentYear) {
        return setError(`Birth year must be less than ${currentYear}.`);
      }
    }

    try {
      setLoading(true);

      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        role: form.role,
        dob: form.dob,
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
            Create an Account
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

            {/* Date of Birth */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Date of Birth
              </Typography>
              <TextField
                fullWidth
                name="dob"
                type="date"
                variant="outlined"
                size="small"
                value={form.dob}
                onChange={handleChange}
                inputProps={{
                  max: maxDobStr,
                }}
                InputLabelProps={{ shrink: true }}
                error={!!dobError}
                helperText={
                  dobError || `Birth year must be before ${currentYear}`
                }
              />
            </Box>

            {/* Role Selection Dropdown */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Select Role *
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="CLIENT">Client</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
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
            >
              <Typography
                align="center"
                sx={{ mt: 2 }}
                color="primary"
                fontWeight={500}
              >
                Already have an account? Login
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
