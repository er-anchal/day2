import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Grid,
  Card,
} from "@mui/material";
import { useThemeContext } from "../context/ThemeContext";

const RoleAccess = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { darkMode, bgColor, cardColor, textColor, borderColor } = useThemeContext();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States for dynamic module creation
  const [newModuleName, setNewModuleName] = useState("");
  const [newModulePath, setNewModulePath] = useState("");
  const [addingModule, setAddingModule] = useState(false);

  const roles = ["CLIENT", "USER", "ADMIN", "SUPER ADMIN"];

  // Matrix state holding allowed modules for each role
  const [matrix, setMatrix] = useState({
    CLIENT: [],
    USER: [],
    ADMIN: [],
    "SUPER ADMIN": [],
  });

  const fetchModulesAndMatrix = async (preserveLocalMatrix = false) => {
    try {
      if (!preserveLocalMatrix) {
        setLoading(true);
      }

      // 1. Fetch all active modules
      const resModules = await fetch(`${API_URL}/modules`);
      const dataModules = await resModules.json();
      const loadedModules = dataModules.data || [];
      setModules(loadedModules);

      if (!preserveLocalMatrix) {
        // 2. Fetch all role accesses from the database
        const resAccess = await fetch(`${API_URL}/role-access`);
        const dataAccess = await resAccess.json();

        const newMatrix = {
          CLIENT: [],
          USER: [],
          ADMIN: [],
          "SUPER ADMIN": [],
        };

        // Populate matrix from database
        dataAccess.forEach((doc) => {
          if (doc.roleName && newMatrix[doc.roleName] !== undefined) {
            newMatrix[doc.roleName] = doc.moduleAccess?.map((item) => item.moduleName) || [];
          }
        });

        setMatrix(newMatrix);
      }
    } catch (error) {
      console.error("Error loading matrix data:", error);
    } finally {
      if (!preserveLocalMatrix) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchModulesAndMatrix();
  }, []);

  const handleCheckboxToggle = (moduleName, roleName) => {
    setMatrix((prev) => {
      const allowed = prev[roleName] || [];
      const updated = allowed.includes(moduleName)
        ? allowed.filter((item) => item !== moduleName)
        : [...allowed, moduleName];

      return {
        ...prev,
        [roleName]: updated,
      };
    });
  };

  // Dynamically add a new module using API call
  const handleAddModule = async () => {
    if (!newModuleName.trim() || !newModulePath.trim()) {
      alert("Please enter both Module Name and Route Path.");
      return;
    }

    try {
      setAddingModule(true);

      const res = await fetch(`${API_URL}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newModuleName.trim(),
          path: newModulePath.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create module");
      }

      // Reset text inputs
      setNewModuleName("");
      setNewModulePath("");

      // Re-fetch all modules & matrix to automatically show the new row!
      await fetchModulesAndMatrix(true);
      alert("New Module added dynamically!");
    } catch (error) {
      console.error("Error creating module:", error);
      alert(error.message || "Failed to create module.");
    } finally {
      setAddingModule(false);
    }
  };

  const handleSaveMatrix = async () => {
    try {
      setSaving(true);

      // Save module access for each role sequentially
      for (const roleName of roles) {
        const payload = {
          roleName,
          moduleAccess: matrix[roleName].map((moduleName) => ({
            moduleName,
            permissions: { view: true, create: false, edit: false, delete: false },
          })),
        };

        const response = await fetch(`${API_URL}/role-access`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to save permissions for role: ${roleName}`);
        }
      }

      alert("Role Access Matrix saved successfully!");
    } catch (error) {
      console.error("Error saving matrix:", error);
      alert(error.message || "Failed to save role-module access settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
        <CircularProgress sx={{ color: darkMode ? "#c6ff00" : "#1976d2" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          bgcolor: darkMode ? "#141821" : "#ffffff",
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Role-Module Allocation Matrix
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage and create features dynamically. Select checkboxes to assign permissions.
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* DYNAMIC MODULE CREATION FORM */}
        <Box
          sx={{
            mb: 4,
            p: 2.5,
            borderRadius: 2.5,
            border: `1px dashed ${borderColor}`,
            bgcolor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Add New Module Dynamically
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            Register a new route/feature. It will instantly add a new row to the table matrix below.
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                label="Module Name (e.g. Video Editor)"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: darkMode ? "#8a99ad" : undefined },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: borderColor },
                    "& input": { color: textColor },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Route Path (e.g. /video-editor)"
                value={newModulePath}
                onChange={(e) => setNewModulePath(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: darkMode ? "#8a99ad" : undefined },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: borderColor },
                    "& input": { color: textColor },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="contained"
                disabled={addingModule}
                onClick={handleAddModule}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  py: 1,
                  bgcolor: darkMode ? "#c6ff00" : "#1976d2",
                  color: darkMode ? "#000" : "#fff",
                  "&:hover": {
                    bgcolor: darkMode ? "#b2e600" : "#1565c0",
                  },
                }}
              >
                {addingModule ? "Creating..." : "Add Module"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {modules.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 6, fontStyle: "italic" }}>
            No modules found in the system. Use the form above to add your first module!
          </Typography>
        ) : (
          <>
            <TableContainer
              sx={{
                display: { xs: "none", lg: "block" },
                borderRadius: 2,
                border: `1px solid ${borderColor}`,
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead
                  sx={{
                    bgcolor: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: textColor }}>
                      Module Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: textColor }}>
                      Route Path
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell
                        key={role}
                        align="center"
                        sx={{ fontWeight: 700, fontSize: "0.95rem", color: textColor }}
                      >
                        {role}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow
                      key={module._id}
                      sx={{
                        "&:hover": {
                          bgcolor: darkMode ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.005)",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: textColor }}>{module.name}</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontFamily: "monospace" }}>
                        {module.path}
                      </TableCell>
                      {roles.map((role) => {
                        const isChecked = matrix[role]?.includes(module.name) || false;
                        return (
                          <TableCell key={role} align="center">
                            <Checkbox
                              checked={isChecked}
                              onChange={() => handleCheckboxToggle(module.name, role)}
                              sx={{
                                color: darkMode ? "#8a99ad" : "#1976d2",
                                "&.Mui-checked": {
                                  color: darkMode ? "#c6ff00" : "#1976d2",
                                },
                              }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* MOBILE & TABLET MODULAR CARDS */}
            <Box
              sx={{
                display: { xs: "grid", lg: "none" },
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 2.5,
              }}
            >
              {modules.map((module) => (
                <Card
                  key={module._id}
                  sx={{
                    bgcolor: darkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.01)",
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 3,
                    boxShadow: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: darkMode ? "#c6ff00" : "#1976d2",
                      boxShadow: darkMode
                        ? "0 4px 20px rgba(198, 255, 0, 0.08)"
                        : "0 4px 20px rgba(25, 118, 210, 0.08)",
                    },
                    p: 2.5,
                  }}
                >
                  {/* Header */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} color={textColor}>
                      {module.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        bgcolor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                        color: darkMode ? "#8a99ad" : "text.secondary",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        display: "inline-block",
                        mt: 0.5,
                      }}
                    >
                      {module.path}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: borderColor }} />

                  {/* Roles Selection */}
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: textColor }}>
                    Assigned Roles:
                  </Typography>
                  
                  <Grid container spacing={1.5}>
                    {roles.map((role) => {
                      const isChecked = matrix[role]?.includes(module.name) || false;
                      return (
                        <Grid item xs={6} key={role}>
                          <Box
                            onClick={() => handleCheckboxToggle(module.name, role)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 0.75,
                              borderRadius: 2,
                              border: `1px solid ${isChecked ? (darkMode ? "#c6ff00" : "#1976d2") : borderColor}`,
                              bgcolor: isChecked 
                                ? (darkMode ? "rgba(198, 255, 0, 0.04)" : "rgba(25, 118, 210, 0.04)") 
                                : "transparent",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              "&:hover": {
                                bgcolor: isChecked 
                                  ? (darkMode ? "rgba(198, 255, 0, 0.08)" : "rgba(25, 118, 210, 0.08)") 
                                  : (darkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)"),
                              }
                            }}
                          >
                            <Checkbox
                              checked={isChecked}
                              onChange={(e) => {
                                e.stopPropagation(); // prevent double toggle
                                handleCheckboxToggle(module.name, role);
                              }}
                              size="small"
                              sx={{
                                p: 0.5,
                                mr: 0.75,
                                color: darkMode ? "#8a99ad" : "#1976d2",
                                "&.Mui-checked": {
                                  color: darkMode ? "#c6ff00" : "#1976d2",
                                },
                              }}
                            />
                            <Typography variant="caption" fontWeight={600} sx={{ userSelect: "none", color: textColor }}>
                              {role}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Card>
              ))}
            </Box>
          </>
        )}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            disabled={saving}
            onClick={handleSaveMatrix}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderRadius: "8px",
              bgcolor: darkMode ? "#c6ff00" : "#1976d2",
              color: darkMode ? "#000" : "#fff",
              "&:hover": {
                bgcolor: darkMode ? "#b2e600" : "#1565c0",
              },
            }}
          >
            {saving ? "Saving Matrix..." : "Save Allocation Matrix"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RoleAccess;
