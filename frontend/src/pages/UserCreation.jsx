import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Link,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  MenuItem,
  Dialog,
  useTheme,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import { useThemeContext } from "../context/ThemeContext";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BadgeIcon from "@mui/icons-material/Badge";
import CategoryIcon from "@mui/icons-material/Category";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const UserCreation = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    designation: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    gstNumber: "",
    password: "",
    confirmPassword: "",
    panNumber: "",
    industry: "",
    dob: "",
    role: "USER",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const { darkMode } = useThemeContext();
  const [showForm, setShowForm] = useState(false);
  const theme = useTheme();
  const {
    // darkMode,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ---------------- FETCH USERS ---------------- */
  const fetchUsers = async () => {
    try {
      setListLoading(true);

      const token = localStorage.getItem("token");
      console.log("TOKEN:", token);

      const res = await axios.get(`${API_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("USERS:", res.data);

      setUsers(res.data?.users || []);
    } catch (err) {
      console.error(
        "ERROR:",
        err.response?.status,
        err.response?.data || err.message,
      );
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const handleEditClick = (user) => {
    setEditUser({
      id: user._id,
      name: user.name || "",
      companyName: user.companyName || "",
      designation: user.designation || "",
      phone: user.phone || "",
      alternatePhone: user.alternatePhone || "",
      email: user.email || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      country: user.country || "India",
      pincode: user.pincode || "",
      gstNumber: user.gstNumber || "",
      industry: user.industry || "",
      panNumber: user.panNumber || "",
      dob: user.dob || "",
      role: user.role || "USER",
    });

    setOpenEdit(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/auth/users/${id}/status`,
        {
          isActive: 1, // deactivate
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      fetchUsers();
    } catch (err) {
      console.error("Soft delete failed:", err);
    }
  };
  /* ---------------- CREATE USER ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      await axios.post(`${API_URL}/auth/register`, {
        name: form.name,
        companyName: form.companyName,
        designation: form.designation,
        phone: form.phone,
        alternatePhone: form.alternatePhone,
        email: form.email,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        pincode: form.pincode,
        gstNumber: form.gstNumber,
        industry: form.industry,
        panNumber: form.panNumber,
        password: form.password,
        role: form.role,
        dob: form.dob,
      });

      // Reset form after create
      setForm({
        name: "",
        companyName: "",
        designation: "",
        phone: "",
        alternatePhone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
        gstNumber: "",
        password: "",
        confirmPassword: "",
        industry: "",
        panNumber: "",
        dob: "",
        role: "USER",
      });
      // Refresh user list
      fetchUsers();

      alert("User created successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/auth/users/${editUser.id}`,
        {
          name: editUser.name,
          companyName: editUser.companyName,
          designation: editUser.designation,
          phone: editUser.phone,
          alternatePhone: editUser.alternatePhone,
          email: editUser.email,
          address: editUser.address,
          city: editUser.city,
          state: editUser.state,
          country: editUser.country,
          pincode: editUser.pincode,
          gstNumber: editUser.gstNumber,
          industry: editUser.industry,
          panNumber: editUser.panNumber,
          dob: editUser.dob,
          role: editUser.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOpenEdit(false);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };
  return (
    <Box sx={{ px: 2, py: 3, width: "100%" }}>
      <Box
        sx={{
          width: "100%",
        }}
      >
        <Grid
          container
          spacing={3}
          sx={{
            width: "100%",
            m: 0, // remove negative margin added by Grid
          }}
        >
          <Grid
            container
            spacing={3}
            sx={{
              width: "100%",
              m: 0,
            }}
          >
            {/* USER LIST SECTION */}
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  bgcolor: bgColor,
                  borderRadius: 3,
                  width: "100%",
                }}
              >
                {/* Header Row */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    sx={{
                      color: darkMode ? "#ffffff" : "#1976d2",
                    }}
                  >
                    Users / Clients List
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={showForm ? <CloseIcon /> : <AddIcon />}
                    onClick={() => setShowForm((prev) => !prev)}
                    sx={{
                      borderRadius: 2,
                      px: 2.5,
                      py: 1,
                      fontWeight: 600,
                      bgcolor: darkMode ? "#1e293b" : "#1976d2",
                      "&:hover": {
                        bgcolor: darkMode ? "#334155" : "#1565c0",
                      },
                    }}
                  >
                    {showForm ? "Close Form" : "Create User"}
                  </Button>
                </Box>

                {/* FORM APPEARS DIRECTLY BELOW BUTTON */}
                {showForm && (
                  <Box sx={{ mt: 3 }}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 4,
                        borderRadius: 3,
                        bgcolor: cardColor,
                        color: textColor,

                        // Same border style as cards
                        border: darkMode
                          ? "1px solid rgba(255, 255, 255, 0.25)"
                          : "1px solid #e2e8f0",

                        // Same shadow style as cards
                        boxShadow: darkMode
                          ? "0 4px 12px rgba(0,0,0,0.4)"
                          : "0 4px 12px rgba(0,0,0,0.08)",

                        transition: "all 0.3s ease",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          mb: 3,
                          color: textColor,
                        }}
                      >
                        Create User / Client
                      </Typography>

                      {error && (
                        <Typography color="error" sx={{ mb: 2 }}>
                          {error}
                        </Typography>
                      )}

                      <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                          {/* Your existing form fields remain unchanged */}

                          {/* Name */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Name"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              required
                              placeholder="Enter your name"
                              InputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>

                          {/* Company Name */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Company Name"
                              name="companyName"
                              value={form.companyName}
                              onChange={handleChange}
                              required
                              placeholder="Enter your company name"
                              InputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>

                          {/* Designation */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Designation"
                              name="designation"
                              value={form.designation}
                              onChange={handleChange}
                              placeholder="Enter your designation"
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>

                          {/* Phone */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Phone"
                              name="phone"
                              value={form.phone}
                              onChange={handleChange}
                              placeholder="Enter phone number"
                              required
                              inputProps={{
                                maxLength: 10,
                                pattern: "[0-9]{10}",
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Alternate Phone"
                              name="alternatePhone"
                              value={form.alternatePhone}
                              onChange={handleChange}
                              placeholder="Enter your alternate phone number"
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>

                          {/* Email */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Email"
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              placeholder="Enter email"
                              required
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>

                          {/* PAN Number */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="PAN Number"
                              name="panNumber"
                              value={form.panNumber}
                              onChange={handleChange}
                              placeholder="Enter PAN number"
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>

                          {/* Password */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              type="password"
                              label="Password"
                              name="password"
                              value={form.password}
                              onChange={handleChange}
                              placeholder="Enter password"
                              required
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>

                          {/* Confirm Password */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              type="password"
                              label="Confirm Password"
                              name="confirmPassword"
                              value={form.confirmPassword}
                              onChange={handleChange}
                              required
                              placeholder="Enter your confirm password"
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="GST Number"
                              name="gstNumber"
                              value={form.gstNumber}
                              onChange={handleChange}
                              placeholder="Enter GST number"
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Address"
                              name="address"
                              value={form.address}
                              onChange={handleChange}
                              placeholder="Enter address"
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="City"
                              name="city"
                              value={form.city}
                              onChange={handleChange}
                              placeholder="Enter city"
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="State"
                              name="state"
                              value={form.state}
                              onChange={handleChange}
                              placeholder="Enter state"
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Country"
                              name="country"
                              value={form.country}
                              onChange={handleChange}
                              placeholder="Enter country"
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Pincode"
                              name="pincode"
                              value={form.pincode}
                              onChange={handleChange}
                              placeholder="Enter pincode"
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              type="dob"
                              label="Date Of Birth"
                              name="dob"
                              value={form.dob}
                              onChange={handleChange}
                              placeholder="Enter date of birth"
                              inputProps={{
                                style: {
                                  color: darkMode ? "#fff" : "#000",
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            />
                          </Grid>
                          {/* Industry */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl
                              fullWidth
                              size="small"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  color: darkMode ? "#fff" : "#000",

                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },

                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },

                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            >
                              <InputLabel>Industry</InputLabel>
                              <Select
                                name="industry"
                                value={form.industry}
                                label="Industry"
                                onChange={handleChange}
                              >
                                <MenuItem value="JEWELLERY">Jewellery</MenuItem>
                                <MenuItem value="FASHION">Fashion</MenuItem>
                                <MenuItem value="REAL ESTATE">
                                  Real Estate
                                </MenuItem>
                                <MenuItem value="EDUCATION">Education</MenuItem>
                                <MenuItem value="HEALTHCARE">
                                  Healthcare
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          {/* Role */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl
                              fullWidth
                              size="small"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  color: darkMode ? "#fff" : "#000",
                                  "& fieldset": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: darkMode
                                      ? "#ffffff"
                                      : "#1976d2",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: darkMode ? "#cbd5e1" : "#64748b",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                  color: darkMode ? "#ffffff" : "#1976d2",
                                },
                              }}
                            >
                              <InputLabel>Role</InputLabel>

                              <Select
                                name="role"
                                value={form.role}
                                label="Role"
                                onChange={handleChange} // ✅ correct
                              >
                                <MenuItem value="USER">USER</MenuItem>
                                <MenuItem value="CLIENT">CLIENT</MenuItem>
                                <MenuItem value="ADMIN">ADMIN</MenuItem>
                                <MenuItem value="SUPER ADMIN">
                                  SUPER ADMIN
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          {/* Submit Button */}
                          <Grid size={{ xs: 12 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 2,
                                mt: 2,
                              }}
                            >
                              <Button
                                variant="outlined"
                                onClick={() => setShowForm(false)}
                                sx={{
                                  color: textColor,
                                  borderColor: darkMode
                                    ? "rgba(255,255,255,0.3)"
                                    : "#cbd5e1",
                                  "&:hover": {
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.5)"
                                      : "#94a3b8",
                                  },
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{
                                  minWidth: 150,
                                  fontWeight: 600,
                                  bgcolor: darkMode ? "#1e293b" : "#1976d2",

                                  // ✅ white border
                                  border: "1px solid #ffffff",

                                  "&:hover": {
                                    bgcolor: darkMode ? "#334155" : "#1565c0",
                                    border: "1px solid #ffffff",
                                  },
                                }}
                              >
                                {loading ? "Creating..." : "Create User"}
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* USER LIST SECTION */}
                <Divider sx={{ my: 3 }} />

                {listLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 4,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : users.length === 0 ? (
                  <Typography>No users found.</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {users.map((user) => (
                      <Grid key={user._id} size={{ xs: 12, sm: 6, lg: 2 }}>
                        <Card
                          variant="outlined"
                          onClick={() =>
                            navigate("/roleaccess", { state: { user } })
                          }
                          sx={{
                            height: "100%",
                            borderRadius: 3,
                            cursor: "pointer",
                            bgcolor: cardColor,
                            color: textColor,

                            // White border in dark mode, light gray border in light mode
                            border: darkMode
                              ? "1px solid rgba(255, 255, 255, 0.25)"
                              : "1px solid #e2e8f0",

                            boxShadow: darkMode
                              ? "0 4px 12px rgba(0,0,0,0.4)"
                              : "0 4px 12px rgba(0,0,0,0.08)",

                            transition: "all 0.3s ease",

                            "&:hover": {
                              transform: "translateY(-4px)",
                              border: darkMode
                                ? "1px solid rgba(255, 255, 255, 0.5)"
                                : "1px solid #cbd5e1",
                              boxShadow: darkMode
                                ? "0 8px 20px rgba(0,0,0,0.5)"
                                : "0 8px 20px rgba(0,0,0,0.12)",
                            },
                          }}
                        >
                          <CardContent>
                            {/* Header */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1,
                              }}
                            >
                              <Typography variant="h6" fontWeight={600}>
                                {user.name}
                              </Typography>

                              <Chip
                                label={user.role}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  color: "#fff",
                                  bgcolor:
                                    user.role === "ADMIN"
                                      ? "#ef4444"
                                      : user.role === "CLIENT"
                                        ? "#13e32f"
                                        : user.role === "USER"
                                          ? "#1976d2"
                                          : "#111827",
                                }}
                              />
                            </Box>
                            {/* Created Date + Actions */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 2,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: secondaryText,
                                  fontSize: "0.7rem",
                                }}
                              >
                                📅{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                }}
                              >
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(user);
                                  }}
                                  sx={{
                                    minWidth: 25,
                                    width: 25,
                                    height: 25,
                                    p: 0,
                                    borderRadius: 2,
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </Button>

                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(user._id);
                                  }}
                                  sx={{
                                    minWidth: 25,
                                    width: 25,
                                    height: 25,
                                    p: 0,
                                    borderRadius: 2,
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </Button>
                              </Box>
                            </Box>

                            {/* Email */}
                            {/* <Typography variant="body2" color="text.secondary">
📧 {user.email}
</Typography> */}

                            {/* Phone */}
                            {/* <Typography variant="body2" color="text.secondary">
📱 {user.phone}
</Typography> */}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
        <DialogTitle>Edit User</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            value={editUser?.name || ""}
            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
          />
          {/*  Company Name */}
          <TextField
            fullWidth
            margin="dense"
            label="Company Name"
            value={editUser?.companyName || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, companyName: e.target.value })
            }
          />

          {/* Designation */}
          <TextField
            fullWidth
            margin="dense"
            label="Designation"
            value={editUser?.designation || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, designation: e.target.value })
            }
          />

          <TextField
            fullWidth
            margin="dense"
            label="Phone"
            value={editUser?.phone || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, phone: e.target.value })
            }
          />

          <TextField
            fullWidth
            margin="dense"
            label="Email"
            value={editUser?.email || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, email: e.target.value })
            }
          />
          {/* Address */}
          <TextField
            fullWidth
            margin="dense"
            multiline
            rows={2}
            label="Address"
            value={editUser?.address || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, address: e.target.value })
            }
          />

          {/* City */}
          <TextField
            fullWidth
            margin="dense"
            label="City"
            value={editUser?.city || ""}
            onChange={(e) => setEditUser({ ...editUser, city: e.target.value })}
          />

          {/* State */}
          <TextField
            fullWidth
            margin="dense"
            label="State"
            value={editUser?.state || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, state: e.target.value })
            }
          />

          {/* Country */}
          <TextField
            fullWidth
            margin="dense"
            label="Country"
            value={editUser?.country || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, country: e.target.value })
            }
          />

          {/* GST Number */}
          <TextField
            fullWidth
            margin="dense"
            label="GST Number"
            value={editUser?.gstNumber || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, gstNumber: e.target.value })
            }
          />
          {/* Pan number */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ mb: 0.5 }}>PAN Number</Typography>
            <TextField
              fullWidth
              size="small"
              name="panNumber"
              value={editUser?.panNumber || ""}
              onChange={handleChange}
              placeholder="Enter PAN number"
            />{" "}
          </Box>
          {/* industry */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Industry</InputLabel>
            <Select
              name="industry"
              value={editUser?.industry || ""}
              label="Industry"
              onChange={handleChange}
            >
              <MenuItem value="JEWELLERY">Jewellery</MenuItem>
              <MenuItem value="FASHION">Fashion</MenuItem>
              <MenuItem value="REAL ESTATE">Real Estate</MenuItem>
              <MenuItem value="EDUCATION">Education</MenuItem>
              <MenuItem value="HEALTHCARE">Healthcare</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={editUser?.role || ""}
              label="Role"
              onChange={(e) =>
                setEditUser({ ...editUser, role: e.target.value })
              }
            >
              <MenuItem value="USER">USER</MenuItem>
              <MenuItem value="CLIENT">CLIENT</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="SUPER ADMIN">SUPER ADMIN</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserCreation;
