import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  LocalOffer as LocalOfferIcon,
  HelpOutline as HelpOutlineIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../pages/auth/AuthContext";
import Logo from "./Logo";

const drawerWidth = 260;

const AdminLayout = (props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { text: "Templates", icon: <DashboardIcon />, path: "/templates" },
    { text: "Categories", icon: <CategoryIcon />, path: "/categories" },
    { text: "Subcategories", icon: <CategoryIcon />, path: "/subcategories" },
    { text: "Pricing Plans", icon: <LocalOfferIcon />, path: "/admin/pricing" },
    { text: "Manage FAQs", icon: <HelpOutlineIcon />, path: "/admin/faqs" },
    { text: "User Queries", icon: <QuestionAnswerIcon />, path: "/admin/queries" },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: "center", py: 2 }}>
        <Logo color={theme.palette.text.primary} variant="navbar" />
      </Toolbar>
      <Divider />
      <List sx={{ px: 2, mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (mobileOpen) handleDrawerClose();
              }}
              sx={{
                borderRadius: "8px",
                backgroundColor: location.pathname === item.path ? "rgba(198, 255, 0, 0.15)" : "transparent",
                color: location.pathname === item.path ? "#c6ff00" : "inherit",
                "&:hover": {
                  backgroundColor: "rgba(198, 255, 0, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? "#c6ff00" : "inherit",
                  minWidth: "40px",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? "bold" : "medium",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ position: "absolute", bottom: 20, width: "100%", px: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "8px",
              color: "error.main",
              "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.08)" },
            }}
          >
            <ListItemIcon sx={{ color: "error.main", minWidth: "40px" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </Box>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
          display: { sm: "none" },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: "bold" }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="admin navigation"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, borderRight: "1px solid rgba(255, 255, 255, 0.12)" },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: "64px", sm: 0 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
