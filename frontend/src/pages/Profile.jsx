import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Collections as CollectionsIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  ContactMail as ContactMailIcon,
  Logout as LogoutIcon,
  Favorite,
  ImportContacts,
  DesignServices as DesignServicesIcon,
  AutoAwesome,
  UsbRounded,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
  });
  const [dobError, setDobError] = useState("");

  // DOB constraints
  const todayDate = new Date();
  const maxDob = new Date(todayDate);
  maxDob.setDate(todayDate.getDate() - 1);
  const maxDobStr = maxDob.toISOString().split("T")[0];
  const currentYear = todayDate.getFullYear();

  // Sidebar menu items
  const isAdmin = user?.role === "ADMIN";

  const adminMenuItems = [
    {
      label: "Profile",
      icon: <PersonIcon />,
      path: "/profile",
    },
    {
      label: "Templates",
      icon: <CollectionsIcon />,
      path: "/templates",
    },
    {
      label: "Categories",
      icon: <CategoryIcon />,
      path: "/categories",
    },
    {
      label: "Subcategories",
      icon: <CategoryIcon />,
      path: "/subcategories",
    },
    {
      label: "My Designs",
      icon: <DesignServicesIcon />,
      path: "/my-designs",
    },
    {
      label: "Favorites",
      icon: <Favorite />,
      path: "/favorites",
    },
    {
      label: "My Magazines",
      icon: <ImportContacts />,
      path: "/my-magazines",
    },
    {
      label: "User Creation",
      icon: <UsbRounded />,
      path: "/usercreation",
    },
    {
      label: "Pricing",
      icon: <PaymentIcon />,
      path: "/pricing",
    },
    {
      label: "Contact Us",
      icon: <ContactMailIcon />,
      path: "/contact-us",
    },
    {
      label: "Notifications",
      icon: <NotificationsIcon />,
      path: "/notifications",
    },
  ];

  const userMenuItems = [
    {
      label: "Profile",
      icon: <PersonIcon />,
      path: "/profile",
    },
    {
      label: "Generate",
      icon: <AutoAwesome />,
      path: "/dashboard",
    },
    {
      label: "Create Reel",
      icon: <VideocamOutlinedIcon />,
      path: "/create-reel",
    },
    {
      label: "Catalogue",
      icon: <MenuBookOutlinedIcon />,
      path: "/catalogue",
    },
    {
      label: "My Designs",
      icon: <DesignServicesIcon />,
      path: "/my-designs",
    },
    {
      label: "Favorites",
      icon: <Favorite />,
      path: "/favorites",
    },
    {
      label: "My Magazines",
      icon: <ImportContacts />,
      path: "/my-magazines",
    },
    {
      label: "Pricing",
      icon: <PaymentIcon />,
      path: "/pricing",
    },
    {
      label: "Contact Us",
      icon: <ContactMailIcon />,
      path: "/contact-us",
    },
    {
      label: "Notifications",
      icon: <NotificationsIcon />,
      path: "/notifications",
    },
  ];

  const [pricing, setPricing] = useState(null);

  // Final sidebar items
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
        setForm({
          name: res.data.user.name || "",
          phone: res.data.user.phone || "",
          email: res.data.user.email || "",
          dob: res.data.user.dob ? res.data.user.dob.split('T')[0] : "",
        });
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchPricing = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/pricing/my-plan`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setPricing(res.data);
      } catch (err) {
        console.error("Pricing fetch failed", err);
      }
    };

    fetchPricing();
  }, []);

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

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setUser(res.data.user);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        p: 3,
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* LEFT SIDEBAR */}
      <Paper
        elevation={3}
        sx={{
          width: 260,
          p: 2,
          borderRadius: 3,
          height: "fit-content",
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          Navigation
        </Typography>

        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.label}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mb: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Paper>

      {/* RIGHT PROFILE SECTION */}
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          display="flex"
          alignItems="center"
          gap={1}
          mb={3}
        >
          <PersonAddAlt1Icon />
          Profile
        </Typography>

        {/* NAME */}
        {editMode ? (
          <TextField
            fullWidth
            name="name"
            label="Name"
            value={form.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        ) : (
          <Typography sx={{ mb: 2 }}>
            <strong>Name:</strong> {user.name}
          </Typography>
        )}

        {/* PHONE */}
        {editMode ? (
          <TextField
            fullWidth
            name="phone"
            label="Phone"
            value={form.phone}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        ) : (
          <Typography sx={{ mb: 2 }}>
            <strong>Phone:</strong> {user.phone}
          </Typography>
        )}

        {/* EMAIL */}
        {editMode ? (
          <TextField
            fullWidth
            name="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        ) : (
          <Typography sx={{ mb: 2 }}>
            <strong>Email:</strong> {user.email}
          </Typography>
        )}

        {/* DOB */}
        {editMode ? (
          <TextField
            fullWidth
            name="dob"
            type="date"
            label="Date of Birth"
            value={form.dob}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: maxDobStr }}
            error={!!dobError}
            helperText={dobError || `Birth year must be before ${currentYear}`}
            sx={{ mb: 2 }}
          />
        ) : (
          <Typography sx={{ mb: 2 }}>
            <strong>Date of Birth:</strong> {user.dob ? new Date(user.dob).toLocaleDateString() : "Not set"}
          </Typography>
        )}

        <Typography sx={{ mb: 1 }}>
          <strong>Role:</strong> {user.role}
        </Typography>

        <Typography sx={{ mb: 3 }}>
          <strong>Plan:</strong> {user.plan || "Free"}
        </Typography>

        {/* SUBSCRIPTION & CREDITS SECTION */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" fontWeight={700} mb={2}>
          Subscription & Usage
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Paper
            variant="outlined"
            sx={{ p: 2, textAlign: "center", borderRadius: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              Image Credits
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary">
              {pricing
                ? `${pricing.imageCredits.used} / ${pricing.imageCredits.allocated}`
                : "0 / 0"}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: 2, textAlign: "center", borderRadius: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              Video Credits
            </Typography>
            <Typography variant="h5" fontWeight={700} color="secondary">
              {pricing
                ? `${pricing.videoCredits.used} / ${pricing.videoCredits.allocated}`
                : "0 / 0"}
            </Typography>
          </Paper>
        </Box>

        {pricing && (
          <Typography sx={{ mt: 2, fontSize: "0.9rem", color: "gray" }}>
            <strong>Current Plan:</strong> {pricing.planName} ({pricing.type}){" "}
            <br />
            <strong>Status:</strong>{" "}
            {pricing.isActive === 1 ? "Active" : "Inactive"}
          </Typography>
        )}

        {/* ACTION BUTTONS */}
        <Stack direction="row" spacing={2}>
          {editMode ? (
            <>
              <Button variant="contained" onClick={handleUpdate}>
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setEditMode(false);
                  setForm({
                    name: user.name || "",
                    phone: user.phone || "",
                    email: user.email || "",
                    dob: user.dob ? user.dob.split('T')[0] : "",
                  });
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="contained" onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Profile;
