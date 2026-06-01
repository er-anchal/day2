import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Stack
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useThemeContext } from "../context/ThemeContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DesignServicesIcon from "@mui/icons-material/DesignServices";

export default function TemplateShotsPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const TEMP_URL = import.meta.env.VITE_TEMP_URL;

  const {
    darkMode,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch templates when component mounts
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Fetch all templates (with shots)
        const res = await axios.get(`${API_URL}/template-shots`, { headers });
        setTemplates(res.data || []);
        
        if (res.data && res.data.length > 0) {
          // If templateId is in URL, auto-select it. Otherwise, select the first template.
          const initialTemplate = templateId 
            ? res.data.find(t => t._id === templateId) 
            : res.data[0];
            
          setSelectedTemplate(initialTemplate || res.data[0]);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
        setError("Failed to load templates. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [templateId, API_URL]);

  const handleTemplateChange = (event) => {
    const template = templates.find((t) => t._id === event.target.value);
    setSelectedTemplate(template);
    navigate(`/template-shots/${template._id}`, { replace: true });
  };

  const handleShotClick = (shot) => {
    if (!selectedTemplate) return;
    navigate(
      `/design/new?bg=${encodeURIComponent(
        `${TEMP_URL}${shot}`
      )}&templateId=${selectedTemplate._id}`
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: bgColor,
        }}
      >
        <CircularProgress size={50} sx={{ color: "#1976d2" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, bgcolor: bgColor, minHeight: "100vh" }}>
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Box>
    );
  }

  // A template might not have any explicit shots array. Let's fall back to imageUrl if empty.
  const hasShots = selectedTemplate && selectedTemplate.shots && selectedTemplate.shots.length > 0;
  const displayShots = hasShots 
    ? selectedTemplate.shots 
    : selectedTemplate 
      ? [selectedTemplate.imageUrl] 
      : [];

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: bgColor, minHeight: "100vh", color: textColor }}>
      {/* Header Section */}
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        justifyContent="space-between" 
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ 
              background: "linear-gradient(45deg, #1976d2, #c6ff00)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent",
              mb: 1
            }}
          >
            Template Shots
          </Typography>
          <Typography variant="body2" sx={{ color: secondaryText }}>
            Choose a mock shot and open it inside the canvas editor.
          </Typography>
        </Box>

        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/templates")}
          sx={{ 
            borderColor: borderColor,
            color: textColor,
            "&:hover": {
              borderColor: textColor,
              bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
            }
          }}
        >
          View All Templates
        </Button>
      </Stack>

      {/* Select Template Dropdown */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: cardColor, 
          border: `1px solid ${borderColor}`,
          borderRadius: 3
        }}
      >
        <FormControl fullWidth variant="outlined">
          <InputLabel id="template-select-label" sx={{ color: textColor }}>
            Select Active Template
          </InputLabel>
          <Select
            labelId="template-select-label"
            id="template-select"
            value={selectedTemplate?._id || ""}
            onChange={handleTemplateChange}
            label="Select Active Template"
            sx={{ 
              color: textColor,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: borderColor
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: textColor
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1976d2"
              }
            }}
          >
            {templates.map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.name || t.fileName || `Template - ${t._id.substring(t._id.length - 6)}`} ({t.categoryName} - {t.subcategoryName})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedTemplate ? (
        <Box>
          <Typography variant="h6" fontWeight={600} mb={3} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DesignServicesIcon sx={{ color: "#1976d2" }} /> 
            Available Shots for: <strong style={{ color: "#1976d2" }}>{selectedTemplate.name || selectedTemplate.fileName}</strong>
          </Typography>

          {!hasShots && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              This template does not have custom shots configured. Showing its main template preview.
            </Alert>
          )}

          <Grid container spacing={3}>
            {displayShots.map((shot, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card
                  onClick={() => handleShotClick(shot)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 4,
                    overflow: "hidden",
                    bgcolor: cardColor,
                    border: `1px solid ${borderColor}`,
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                      "& .shot-overlay": {
                        opacity: 1
                      }
                    }
                  }}
                >
                  <Box sx={{ position: "relative", pt: "100%", overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      image={`${TEMP_URL}${shot}`}
                      alt={`Shot ${index + 1}`}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        bgcolor: darkMode ? "#10141e" : "#f5f5f5",
                        p: 1
                      }}
                    />
                    
                    {/* Hover Overlay */}
                    <Box
                      className="shot-overlay"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        bgcolor: "rgba(0,0,0,0.4)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        opacity: 0,
                        transition: "opacity 0.2s ease-in-out"
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<DesignServicesIcon />}
                        sx={{
                          bgcolor: "#c6ff00",
                          color: "#000",
                          fontWeight: 700,
                          "&:hover": {
                            bgcolor: "#a3d000"
                          }
                        }}
                      >
                        Edit Canvas
                      </Button>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="subtitle2" fontWeight={600} color={textColor}>
                      {hasShots ? `Variation Shot #${index + 1}` : "Primary Template Shot"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Paper sx={{ p: 5, textAlign: "center", bgcolor: cardColor, border: `1px solid ${borderColor}`, borderRadius: 3 }}>
          <Typography variant="h6">No templates available.</Typography>
          <Typography variant="body2" sx={{ color: secondaryText, mt: 1 }}>
            Please upload a template with shots inside the Admin Panel first.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
