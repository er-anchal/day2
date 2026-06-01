import React from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const AdminLayout = () => {
  const location = useLocation();
  const isConversationsPage = location.pathname === "/admin/chatbot-conversations";

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        bgcolor: "background.default",
        transition: "all 0.3s ease"
      }}
    >
      {/* Unified top navbar governed by matrix permissions */}
      <Navbar />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isConversationsPage ? 0 : { xs: 2, sm: 4 },
          width: "100%",
          boxSizing: "border-box",
          overflow: isConversationsPage ? "hidden" : "visible"
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
