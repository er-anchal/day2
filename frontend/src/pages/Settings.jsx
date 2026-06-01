import { useState } from "react";
import { Box, Paper, Tab, Tabs, useTheme } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PaymentIcon from "@mui/icons-material/Payment";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useAuth } from "./auth/AuthContext";
import UserCreation from "./UserCreation";
import AdminPricingPage from "./AdminPricingPage";
import AdminFaqPage from "./AdminFaqPage";
import RoleAccess from "./RoleAccess";
import { useThemeContext } from "../context/ThemeContext";

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const { darkMode, bgColor, textColor, borderColor } = useThemeContext();
  const theme = useTheme();

  const tabs = [
    { label: "User Creation", icon: <PeopleIcon />, component: <UserCreation /> },
    { label: "Pricing Management", icon: <PaymentIcon />, component: <AdminPricingPage /> },
    { label: "FAQ Management", icon: <HelpOutlineIcon />, component: <AdminFaqPage /> },
    { label: "Role Access Matrix", icon: <AdminPanelSettingsIcon />, component: <RoleAccess /> },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: bgColor,
        minHeight: "100%",
        color: textColor,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* TABS CONTAINER */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 0.5,
          borderRadius: "12px",
          bgcolor: darkMode ? "#141821" : "#ffffff",
          border: `1px solid ${borderColor}`,
          display: "flex",
          justifyContent: "flex-start",
          overflowX: "auto",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: "48px",
            width: "100%",
            "& .MuiTabs-indicator": {
              backgroundColor: "#c6ff00", // Sleek vibrant indicator matching user image screenshot!
              height: "3px",
              borderRadius: "3px",
            },
          }}
        >
          {tabs.map((tab, idx) => (
            <Tab
              key={idx}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: darkMode ? "#8a99ad" : "#4b5563",
                minHeight: "48px",
                px: { xs: 2, sm: 3 },
                mx: 0.5,
                borderRadius: "8px",
                transition: "all 0.2s ease",
                "&.Mui-selected": {
                  color: darkMode ? "#c6ff00" : "#1976d2",
                },
                "&:hover": {
                  bgcolor: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                },
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* ACTIVE COMPONENT VIEW */}
      <Box
        sx={{
          animation: "fadeIn 0.3s ease-in-out",
          width: "100%",
        }}
      >
        {tabs[activeTab]?.component}
      </Box>
    </Box>
  );
};

export default Settings;
