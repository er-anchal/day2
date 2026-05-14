import { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Button,
  Drawer,
  Stack,
  List,
  Avatar,
  Menu,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  Typography,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { useAuth } from "../pages/auth/AuthContext";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";

import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import CategoryIcon from "@mui/icons-material/Apps";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  AutoAwesome,
  Favorite,
  ImportContacts,
  UsbRounded,
} from "@mui/icons-material";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ArticleIcon from "@mui/icons-material/Article";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
// import HistoryIcon from "@mui/icons-material/History";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { useThemeContext } from "../context/ThemeContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const commonNavItems = [{ label: "Home", path: "/", icon: <HomeIcon /> }];
// const publicNavItems = [
//   { label: "Home", path: "/", icon: <HomeIcon /> },
//   // { label: "Categories", path: "/categories", icon: <CategoryIcon /> },
//   { label: "Pricing", path: "/pricing", icon: <LocalOfferIcon /> },
//   { label: "Contact", path: "/contact-us", icon: <ContactMailIcon /> },
//   { label: "Blog", path: "/blog", icon: <ArticleIcon /> },
//   // { label: "Company", path: "/about", icon: <BlogIcon /> },
//   // ,
// ]; // nothing when logged out

// const privateNavItems = [
//   { label: "Home", path: "/", icon: <HomeIcon /> },
//   {
//     label: "Templates",
//     path: "/templates",
//     adminOnly: true,
//     icon: <DashboardIcon />,
//   },

//   {
//     label: "Categories",
//     path: "/categories",
//     adminOnly: true,
//     icon: <CategoryIcon />,
//   },
//   {
//     label: "Subcategories",
//     path: "/subcategories",
//     adminOnly: true,
//     icon: <CategoryIcon />,
//   },
//   { label: "My Designs", path: "/my-designs", icon: <DesignServicesIcon /> },
//   { label: "Favorites", path: "/favorites", icon: <Favorite /> },
//   { label: "My Magazines", path: "/my-magazines", icon: <ImportContacts /> },
//   {
//     label: "Generate",
//     path: "/dashboard",
//     // adminOnly: false,
//     icon: <AutoAwesome />,
//   },
//   // { label: "Privacy Policy", path: "/privacy", icon: <ArticleIcon /> },
//   // {
//   //   label: "Terms And Conditions",
//   //   path: "/terms-and-conditions",
//   //   icon: <ArticleIcon />,
//   // },
//   // { label: "Contact Us", path: "/contact-us", icon: <ContactMailIcon /> },
// ];
const adminNavItems = [
  { label: "Templates", path: "/templates", icon: <DashboardIcon /> },
  { label: "Categories", path: "/categories", icon: <CategoryIcon /> },
  { label: "Subcategories", path: "/subcategories", icon: <CategoryIcon /> },
  { label: "My Designs", path: "/my-designs", icon: <DesignServicesIcon /> },
  { label: "Favorites", path: "/favorites", icon: <Favorite /> },
  { label: "My Magazines", path: "/my-magazines", icon: <ImportContacts /> },
  { label: "User Creation", path: "/usercreation", icon: <UsbRounded /> },
  //
];
const userNavItems = [
  {
    label: "Generate",
    path: "/dashboard",
    icon: <AutoAwesome />,
  },
  {
    label: "Create Reel",
    path: "/create-reel",
    icon: <VideocamOutlinedIcon />,
  },
  // {
  //   label: "History",
  //   path: "/history",
  //   icon: <HistoryIcon />,
  // },
  {
    label: "Catalogue",
    path: "/catalogue",
    icon: <MenuBookOutlinedIcon />,
  },
  { label: "My Designs", path: "/my-designs", icon: <DesignServicesIcon /> },
  { label: "Favorites", path: "/favorites", icon: <Favorite /> },
  { label: "My Magazines", path: "/my-magazines", icon: <ImportContacts /> },
];

const navMotion = {
  transition: "transform 0.2s ease",
  "&:hover, &.active": {
    transform: "translateY(-2px)",
  },
};

const Navbar = () => {
  const { token, logout, user } = useAuth();
  const isLoggedIn = !!token;
  const isAdmin = user?.role === "ADMIN";
  const welcomeMessage = isLoggedIn ? `Welcome, ${user?.name || "User"}` : "";
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { darkMode, toggleTheme, textColor } = useThemeContext();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const {
    // darkMode,
    // toggleTheme,
    bgColor,
    cardColor,
    // textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // const handleLogout = () => {
  //   handleMenuClose();
  //   // TODO: clear token / auth here
  //   navigate("/login");
  // };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate("/settings");
  };

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const visibleNavItems = isLoggedIn
    ? [...commonNavItems, ...(isAdmin ? adminNavItems : userNavItems)]
    : commonNavItems;
  // Drawer content
  const drawer = (
    <Box
      sx={{
        width: 250,
        bgcolor: theme.palette.primary.main,
        color: theme.palette.background.paper,
        height: "100%",
        borderRadius: 0, // Remove side rounding
      }}
      role="presentation"
      onClick={handleDrawerToggle}
    >
      <Box sx={{ my: 2 }}>
        <Logo
          color={theme.palette.background.paper}
          variant="drawer"
          onClick={handleDrawerToggle}
        />
      </Box>
      {isLoggedIn ? (
        <Divider sx={{ bgcolor: theme.palette.background.paper }} />
      ) : (
        ""
      )}

      <List>
        {visibleNavItems.map((item) => (
          <ListItemButton
            key={item.label}
            component={NavLink}
            to={item.path}
            end={item.path === "/"}
            sx={{
              color: theme.palette.background.paper,
              "&.active": {
                bgcolor: theme.palette.secondary.main,
                fontWeight: "bold",
              },
            }}
          >
            {item.icon && (
              <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
                {item.icon}
              </Box>
            )}
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}

        <Divider sx={{ my: 1, bgcolor: bgColor }} />

        {!isLoggedIn ? (
          <>
            <ListItemButton
              component={NavLink}
              to="/login"
              sx={{
                color: theme.palette.background.paper,
                "&.active": { bgcolor: theme.palette.secondary.main },
              }}
            >
              <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
                <LoginIcon />
              </Box>
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton
              component={NavLink}
              to="/register"
              sx={{
                color: theme.palette.background.paper,
                "&.active": { bgcolor: theme.palette.secondary.main },
              }}
            >
              <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
                <PersonAddIcon />
              </Box>
              <ListItemText primary="Register" />
            </ListItemButton>
          </>
        ) : (
          <>
            {/* <ListItemButton
              component={NavLink}
              to="/profile"
              sx={{
                color: theme.palette.background.paper,
                "&.active": { bgcolor: theme.palette.secondary.main },
                }}
                >
                <ListItemText primary="Profile" />
                </ListItemButton> */}
            <ListItemButton onClick={handleLogout}>
              <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
                <LogoutIcon />
              </Box>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      {/* <AppBar
        position="static"
        sx={{ bgcolor: theme.palette.primary.main, borderRadius: 0 }}
      > */}
      <AppBar
        position="static"
        sx={{
          background:
            "linear-gradient(90deg, #0b1b3a 0%, #0d47a1 50%, #1976d2 100%)",
          boxShadow: "none",
          borderRadius: 0,
        }}
      >
        <Toolbar>
          {/* Hamburger icon - mobile only */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <Logo color={theme.palette.background.paper} variant="navbar" />
          </Box>

          {/* Desktop menu */}
          <Box
            sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}
          >
            {/* Show welcome message */}
            {isLoggedIn && (
              <Typography
                sx={{
                  color: theme.palette.background.paper,
                  mr: 2,
                  fontWeight: 500,
                }}
                variant="body1"
              >
                {/* {welcomeMessage} */}
              </Typography>
            )}

            {visibleNavItems.map((item) => (
              <Button
                key={item.label}
                component={NavLink}
                to={item.path}
                end={item.path === "/"}
                sx={{
                  color: theme.palette.background.paper,
                  mx: 1,
                  ...navMotion, // ✅ THIS WAS MISSING
                  "&.active": {
                    transform: "translateY(-2px)",
                    borderBottom: `2px solid ${theme.palette.secondary.main}`,
                    borderRadius: 0,
                    fontWeight: "bold",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}

            {!isLoggedIn ? (
              <>
                <Button
                  component={NavLink}
                  to="/login"
                  variant="outlined"
                  sx={{
                    color: theme.palette.background.paper,
                    borderColor: theme.palette.background.paper,
                    mx: 1,
                    ...navMotion,
                    "&.active": {
                      transform: "translateY(-2px)",
                      bgcolor: "rgba(255,255,255,0.15)",
                    },
                  }}
                >
                  Login
                </Button>

                <Button
                  component={NavLink}
                  to="/register"
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    mx: 1,
                    ...navMotion,
                    "&.active": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 6px 12px rgba(0,0,0,0.15)`,
                    },
                  }}
                >
                  Register
                </Button>
              </>
            ) : (
              <>
                {/* <Button
                  component={NavLink}
                  to="/profile"
                  sx={{
                    color: theme.palette.background.paper,
                    mx: 1,
                    ...navMotion, // ✅ THIS WAS MISSING
                    "&.active": {
                      transform: "translateY(-2px)",
                      borderBottom: `3px solid ${theme.palette.secondary.main}`,
                      fontWeight: "bold",
                    },
                  }}
                >
                  Profile
                </Button> */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    onClick={toggleTheme}
                    sx={{
                      minWidth: 40,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: darkMode ? "#141821" : "#f5f5f5",
                      color: textColor,
                      mx: 1,
                    }}
                  >
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </Button>
                  {/* <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: "50px",
                      bgcolor: darkMode ? "#141821" : "#f5f5f5",
                      color: textColor,
                      fontWeight: 600,
                    }}
                  >
                    {/* 10 Credits */}
                  {/* </Box> */}

                  {/* USER MENU */}
                  {isLoggedIn && (
                    <>
                      <Avatar
                        onClick={handleMenuOpen}
                        sx={{
                          bgcolor: "#c6ff00",
                          color: "#000",
                          cursor: "pointer",
                        }}
                      >
                        {user?.name?.charAt(0) || "U"}
                      </Avatar>

                      <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                      >
                        <MenuItem disabled>
                          Welcome, {user?.name || "User"}
                        </MenuItem>

                        <MenuItem onClick={handleProfile}>
                          <ListItemIcon>
                            <PersonIcon fontSize="small" />
                          </ListItemIcon>
                          Profile
                        </MenuItem>

                        <MenuItem onClick={handleSettings}>
                          <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                          </ListItemIcon>
                          Settings
                        </MenuItem>

                        <MenuItem onClick={() => { handleMenuClose(); navigate('/notifications'); }}>
                          <ListItemIcon>
                            <NotificationsIcon fontSize="small" />
                          </ListItemIcon>
                          Notifications
                        </MenuItem>

                        <MenuItem onClick={handleLogout}>
                          <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                          </ListItemIcon>
                          Logout
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </Stack>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 250,
            borderRadius: 0, // Remove rounded corners
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
