import React, { useState, useEffect } from "react";
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
  Collapse,
} from "@mui/material";
import { useAuth } from "../pages/auth/AuthContext";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

const NavbarDropdown = ({ item }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <>
      <Button
        id={`dropdown-button-${item.label.toLowerCase()}`}
        aria-controls={open ? `dropdown-menu-${item.label.toLowerCase()}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          color: theme.palette.background.paper,
          mx: 1,
          textTransform: 'capitalize',
          fontWeight: 500,
          transition: "transform 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            bgcolor: 'rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        {item.label}
      </Button>
      <Menu
        id={`dropdown-menu-${item.label.toLowerCase()}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': `dropdown-button-${item.label.toLowerCase()}`,
        }}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 160,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.background.paper,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }
        }}
      >
        {item.children.map((child) => (
          <MenuItem
            key={child.label}
            onClick={() => handleItemClick(child.path)}
            sx={{
              py: 1,
              px: 2.5,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: theme.palette.background.paper,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.12)'
              }
            }}
          >
            {child.icon && (
              <Box sx={{ display: 'flex', color: theme.palette.secondary.main }}>
                {child.icon}
              </Box>
            )}
            {child.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const Navbar = () => {
  const { token, logout, user, allowedModules } = useAuth();
  const isLoggedIn = !!token;
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER ADMIN";


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
    if (event && event.detail === 0) return; // Prevent synthetic/programmatic clicks from password managers or autofill extensions on mount
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
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (label) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const isSuperAdmin = user?.role === "SUPER ADMIN";

  const allowedMasterChildren = [
    { label: "CAD Catalog (Admin)", path: "/admin/jewellery-configurator", icon: <DashboardIcon /> },
    { label: "Templates", path: "/templates", icon: <DashboardIcon /> },
    { label: "Template Shots", path: "/template-shots", icon: <DashboardIcon /> },
    { label: "Categories", path: "/categories", icon: <CategoryIcon /> },
    { label: "Subcategories", path: "/subcategories", icon: <CategoryIcon /> },
    { label: "Chatbot Q&A", path: "/admin/chatbot-flows", icon: <CategoryIcon /> },
    { label: "Chatbot Analytics", path: "/admin/chatbot-analytics", icon: <DashboardIcon /> },
    { label: "Chatbot Conversations", path: "/admin/chatbot-conversations", icon: <CategoryIcon /> },
  ].filter((item) => {
    if (isSuperAdmin) return true;
    const cleanLabel = item.label.toLowerCase().trim();
    if (cleanLabel === "cad catalog (admin)") return true;
    if (cleanLabel === "template shots") {
      return allowedModules.includes("templates");
    }
    if (cleanLabel === "chatbot q&a") {
      return allowedModules.includes("chatbot") || allowedModules.includes("chatbot q&a");
    }
    if (cleanLabel === "chatbot analytics") {
      return allowedModules.includes("chatbot") || allowedModules.includes("chatbot analytics");
    }
    if (cleanLabel === "chatbot conversations") {
      return allowedModules.includes("chatbot") || allowedModules.includes("chatbot conversations");
    }
    return allowedModules.includes(cleanLabel);
  });

  const allowedHistoryChildren = [
    { label: "My Designs", path: "/my-designs", icon: <DesignServicesIcon /> },
    { label: "Favorites", path: "/favorites", icon: <Favorite /> },
    { label: "My Magazines", path: "/my-magazines", icon: <ImportContacts /> },
  ].filter((item) => {
    if (isSuperAdmin) return true;
    return allowedModules.includes(item.label.toLowerCase().trim());
  });

  // Other dynamic items (which are not part of Master or History dropdowns)
  const otherAllowedItems = [
    { label: "Generate", path: "/dashboard", icon: <AutoAwesome /> },
    { label: "Create Reel", path: "/create-reel", icon: <VideocamOutlinedIcon /> },
    { label: "Catalogue", path: "/catalogue", icon: <MenuBookOutlinedIcon /> },
    { label: "User Creation", path: "/usercreation", icon: <UsbRounded /> },
    { label: "Jewellery Generator", path: "/jewellery-editor", icon: <AutoAwesome /> },
    { label: "3D Configurator", path: "/jewellery-configurator", icon: <AutoAwesome /> },
  ].filter((item) => {
    if (isSuperAdmin) return true;
    const cleanLabel = item.label.toLowerCase().trim();
    if (cleanLabel === "jewellery generator" || cleanLabel === "3d configurator") return true;
    return allowedModules.includes(cleanLabel);
  });


  const visibleNavItems = isLoggedIn
    ? [
        ...commonNavItems,
        ...(allowedMasterChildren.length > 0
          ? [{ label: "Master", isDropdown: true, children: allowedMasterChildren }]
          : []),
        ...(allowedHistoryChildren.length > 0
          ? [{ label: "History", isDropdown: true, children: allowedHistoryChildren }]
          : []),
        ...otherAllowedItems
      ]
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
        {visibleNavItems.map((item) => {
          if (item.isDropdown) {
            const isDropdownOpen = !!openDropdowns[item.label];
            return (
              <React.Fragment key={item.label}>
                <ListItemButton
                  onClick={() => toggleDropdown(item.label)}
                  sx={{
                    color: theme.palette.background.paper,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  <ListItemText primary={item.label} />
                  {isDropdownOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
                <Collapse in={isDropdownOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.label}
                        component={NavLink}
                        to={child.path}
                        onClick={handleDrawerToggle}
                        sx={{
                          pl: 4,
                          color: theme.palette.background.paper,
                          "&.active": {
                            bgcolor: theme.palette.secondary.main,
                            fontWeight: "bold",
                          },
                        }}
                      >
                        {child.icon && (
                          <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
                            {child.icon}
                          </Box>
                        )}
                        <ListItemText primary={child.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }

          return (
            <ListItemButton
              key={item.label}
              component={NavLink}
              to={item.path}
              end={item.path === "/"}
              onClick={handleDrawerToggle}
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
          );
        })}
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

            {visibleNavItems.map((item) => {
              if (item.isDropdown) {
                return <NavbarDropdown key={item.label} item={item} />;
              }
              return (
                <Button
                  key={item.label}
                  component={NavLink}
                  to={item.path}
                  end={item.path === "/"}
                  sx={{
                    color: theme.palette.background.paper,
                    mx: 1,
                    ...navMotion,
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
              );
            })}

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
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Button
                    onClick={toggleTheme}
                    sx={{
                      minWidth: 40,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: darkMode ? "#141821" : "rgba(255,255,255,0.08)",
                      color: theme.palette.background.paper,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
                    }}
                  >
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </Button>

                  {isLoggedIn && (
                    <>
                      <IconButton
                        onClick={() => navigate("/notifications")}
                        sx={{
                          color: theme.palette.background.paper,
                          bgcolor: "rgba(255,255,255,0.08)",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
                          width: 40,
                          height: 40,
                        }}
                      >
                        <NotificationsIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => navigate("/settings")}
                        sx={{
                          color: theme.palette.background.paper,
                          bgcolor: "rgba(255,255,255,0.08)",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
                          width: 40,
                          height: 40,
                        }}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </>
                  )}
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
