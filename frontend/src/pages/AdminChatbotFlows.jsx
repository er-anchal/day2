import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  useTheme,
  Alert,
  InputAdornment,
  Tooltip,
  ClickAwayListener,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Clear as ClearIcon,
  SmartToy as RobotIcon,
  Search as SearchIcon,
  HelpOutline as HelpIcon,
  CompassCalibrationOutlined as CompassIcon,
  Layers as LayersIcon,
  Schema as SchemaIcon,
  PlaylistAddCheck as ChecklistIcon,
  SettingsBackupRestore as ResetIcon,
  QuestionAnswer as QAIcon,
  Image as PhotoIcon,
  Videocam as VideoIcon,
  PictureAsPdf as PdfIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "./auth/AuthContext";
import { useThemeContext } from "../context/ThemeContext";

const resolveMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace("/api", "") 
    : "http://localhost:5001";
  return `${apiBase}${url}`;
};

export default function AdminChatbotFlows() {
  const { token } = useAuth();
  const { bgColor, textColor, cardColor, darkMode, borderColor } = useThemeContext();
  const theme = useTheme();

  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // id of flow being edited, or null for creating
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    question: "",
    answer: "",
    followUps: [],
    isReset: false,
    photoUrl: "",
    videoUrl: "",
    pdfUrl: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadLoading, setUploadLoading] = useState({
    pdf: false,
    photo: false,
    video: false,
  });

  const fetchFlows = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/chatbot/flows`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success) {
        setFlows(response.data.flows || []);
      }
    } catch (error) {
      console.error("Error fetching chatbot flows:", error);
      setErrorMessage("Failed to retrieve chatbot flows from server.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchFlows();
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFollowUpsChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData((prev) => ({
      ...prev,
      followUps: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleEdit = (flow) => {
    setEditingId(flow.id);
    setFormData({
      id: flow.id,
      question: flow.question,
      answer: flow.answer,
      followUps: flow.followUps || [],
      isReset: flow.isReset || false,
      photoUrl: flow.photoUrl || "",
      videoUrl: flow.videoUrl || "",
      pdfUrl: flow.pdfUrl || "",
    });
    setErrorMessage("");
    setSuccessMessage("");
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      id: "",
      question: "",
      answer: "",
      followUps: [],
      isReset: false,
      photoUrl: "",
      videoUrl: "",
      pdfUrl: "",
    });
    setErrorMessage("");
  };

  const handleFileUpload = async (file, type, fieldName) => {
    if (!file) return;

    setUploadLoading((prev) => ({ ...prev, [type]: true }));
    setErrorMessage("");
    setSuccessMessage("");

    const formDataObj = new FormData();
    formDataObj.append("file", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chatbot/flows/upload`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.success && response.data.fileUrl) {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: response.data.fileUrl,
        }));
        setSuccessMessage(`${type.toUpperCase()} file uploaded successfully!`);
      } else {
        setErrorMessage(response.data?.error || "Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage(
        error.response?.data?.error || "An error occurred during file upload."
      );
    } finally {
      setUploadLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const renderUploadWidget = (type, label, value, accept, icon, fieldName) => {
    const isLoading = uploadLoading[type];
    const fileInputId = `upload-input-${type}`;

    const getFileName = (url) => {
      if (!url) return "";
      const parts = url.split("/");
      return parts[parts.length - 1];
    };

    const apiBase = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace("/api", "") 
      : "http://localhost:5001";

    return (
      <Box sx={{ width: "100%" }}>
        <input
          type="file"
          id={fileInputId}
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              handleFileUpload(file, type, fieldName);
            }
          }}
        />

        <Paper
          elevation={0}
          onClick={() => {
            if (!value && !isLoading) {
              document.getElementById(fileInputId).click();
            }
          }}
          sx={{
            height: 48,
            borderRadius: 3,
            border: `1px solid ${borderColor}`,
            bgcolor: value 
              ? (darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)")
              : (darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"),
            display: "flex",
            alignItems: "center",
            px: 1.5,
            cursor: value ? "default" : "pointer",
            transition: "all 0.2s ease",
            boxSizing: "border-box",
            position: "relative",
            "&:hover": {
              borderColor: value ? borderColor : (darkMode ? "#c6ff00" : "#1976d2"),
              bgcolor: value 
                ? (darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)")
                : (darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"),
            },
          }}
        >
          {isLoading ? (
            <Box display="flex" alignItems="center" gap={1.5} width="100%">
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  border: `2px solid ${darkMode ? "#c6ff00" : "#1976d2"}`,
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Uploading...
              </Typography>
            </Box>
          ) : value ? (
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Box display="flex" alignItems="center" gap={1} sx={{ overflow: "hidden", flexGrow: 1 }}>
                {type === "photo" ? (
                  <Box
                    component="img"
                    src={`${apiBase}${value}`}
                    alt="Thumbnail"
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "4px",
                      objectFit: "cover",
                      border: `1px solid ${borderColor}`,
                    }}
                    onError={(e) => {
                      e.target.src = value;
                    }}
                  />
                ) : (
                  <Box sx={{ color: darkMode ? "#c6ff00" : "#1976d2", display: "flex", alignItems: "center" }}>
                    {icon}
                  </Box>
                )}
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textAlign: "left",
                  }}
                >
                  {getFileName(value)}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData((prev) => ({ ...prev, [fieldName]: "" }));
                  const fileInput = document.getElementById(fileInputId);
                  if (fileInput) fileInput.value = "";
                }}
                sx={{
                  color: "#ef4444",
                  p: 0.5,
                  "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" },
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={1.5} width="100%">
              <Box sx={{ color: "text.secondary", display: "flex", alignItems: "center" }}>
                {icon}
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {label}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.question.trim() || !formData.answer.trim()) {
      setErrorMessage("ID, Question, and Predefined Answer are all required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chatbot/flows`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setSuccessMessage(
          editingId
            ? "Predefined chatbot flow updated successfully."
            : "New predefined chatbot flow created successfully."
        );
        resetForm();
        fetchFlows();
      } else {
        setErrorMessage(response.data?.error || "Failed to save chatbot flow.");
      }
    } catch (error) {
      console.error("Error saving chatbot flow:", error);
      setErrorMessage(
        error.response?.data?.error || "An error occurred while saving the chatbot flow."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (flowId) => {
    if (!window.confirm(`Are you sure you want to delete flow: '${flowId}'?`)) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/chatbot/flows/${flowId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setSuccessMessage("Predefined chatbot flow deleted successfully.");
        fetchFlows();
        if (editingId === flowId) {
          resetForm();
        }
      } else {
        setErrorMessage(response.data?.error || "Failed to delete chatbot flow.");
      }
    } catch (error) {
      console.error("Error deleting chatbot flow:", error);
      setErrorMessage(
        error.response?.data?.error || "An error occurred while deleting the chatbot flow."
      );
    }
  };

  // Filter flows based on Search Term
  const filteredFlows = flows.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      f.id.toLowerCase().includes(term) ||
      f.question.toLowerCase().includes(term) ||
      f.answer.toLowerCase().includes(term)
    );
  });

  // FAQ Page inspired search suggestions & navigation logic
  const filteredSuggestions = flows
    .filter((flow) => {
      const q = searchTerm.toLowerCase();
      if (!q) return false;
      return (
        (flow.id && flow.id.toLowerCase().includes(q)) ||
        (flow.question && flow.question.toLowerCase().includes(q)) ||
        (flow.answer && flow.answer.toLowerCase().includes(q))
      );
    })
    .slice(0, 5);

  const handleSuggestionClick = (flow) => {
    setSearchTerm("");
    setShowSuggestions(false);
    setTimeout(() => {
      const element = document.getElementById(`flow-row-${flow.id}`) || document.getElementById(`flow-card-${flow.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Flash-highlight row or card
        element.style.transition = "background-color 0.3s ease";
        const origBg = element.style.backgroundColor;
        element.style.backgroundColor = darkMode ? "rgba(198, 255, 0, 0.25)" : "rgba(25, 118, 210, 0.15)";
        setTimeout(() => {
          element.style.backgroundColor = origBg;
        }, 1500);
      }
    }, 300);
  };

  // List of other IDs that can be linked as follow-ups
  const availableFlowIds = flows
    .map((f) => f.id)
    .filter((id) => id !== formData.id);

  // Statistics calculation for structured dashboard feel
  const totalFlows = flows.length;
  const resetMenuFlows = flows.filter((f) => f.isReset).length;
  const linkableOptions = flows.filter((f) => f.followUps && f.followUps.length > 0).length;

  return (
    <Box
      sx={{
        bgcolor: bgColor,
        color: textColor,
        py: { xs: 3, sm: 5 },
      }}
    >
        {/* ================= HEADER HERO BANNER ================= */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 4,
            background: darkMode
              ? "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)"
              : "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(21, 101, 192, 0.03) 100%)",
            border: `1px solid ${borderColor}`,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: darkMode ? "rgba(198, 255, 0, 0.15)" : "rgba(25, 118, 210, 0.1)",
                color: darkMode ? "#c6ff00" : "#1976d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RobotIcon sx={{ fontSize: 40 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold" textAlign="left" sx={{ letterSpacing: "-0.5px" }}>
                Chatbot Flow Directory
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="left" sx={{ mt: 0.5 }}>
                Configure, construct, and link nested predefined questions and responses dynamically.
              </Typography>
            </Box>
          </Box>

          {/* QUICK STATS WIDGETS */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(3, 1fr)" },
              gap: 2,
              width: { xs: "100%", md: "auto" },
              minWidth: { md: 400 },
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: `1px solid ${borderColor}`,
                bgcolor: cardColor,
                textAlign: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                TOTAL FLOWS
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5 }}>
                {totalFlows}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: `1px solid ${borderColor}`,
                bgcolor: cardColor,
                textAlign: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                RESETS MENU
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="secondary.main" sx={{ mt: 0.5 }}>
                {resetMenuFlows}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: `1px solid ${borderColor}`,
                bgcolor: cardColor,
                textAlign: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                LINKED FLOWS
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={darkMode ? "#c6ff00" : "primary.main"} sx={{ mt: 0.5 }}>
                {linkableOptions}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* FEEDBACK ALERTS */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
        )}

        {/* ================= FORM CARD: SAME WIDTH AS PAGE ================= */}
        <Box sx={{ mb: 4 }}>
          <Card
            sx={{
              bgcolor: cardColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
              boxShadow: "none",
              width: "100%",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 }, width: "100%", boxSizing: "border-box" }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <CompassIcon sx={{ color: darkMode ? "#c6ff00" : "#1976d2" }} />
                <Typography variant="h6" fontWeight="bold" textAlign="left">
                  {editingId ? "Edit Active Flow" : "Add Flow Configuration"}
                </Typography>
              </Box>

              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                {/* ROW 1: CORE FLOW DATA — 4 EQUAL COLUMNS */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                    gap: 3,
                    mb: 3,
                    width: "100%",
                  }}
                >
                  {/* 1. FLOW IDENTITY */}
                  <Box display="flex" flexDirection="column" sx={{ height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1, textAlign: "left" }}>
                      <LayersIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Dialogue Code / ID
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      name="id"
                      placeholder="e.g. canvas_shortcuts"
                      value={formData.id}
                      onChange={handleInputChange}
                      disabled={!!editingId}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: borderColor },
                          height: 48,
                          boxSizing: "border-box",
                        },
                      }}
                    />
                  </Box>

                  {/* 2. DIALOGUE CONTENT */}
                  <Box display="flex" flexDirection="column" sx={{ height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1, textAlign: "left" }}>
                      <QAIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Button Label / Question Text
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      maxRows={4}
                      name="question"
                      placeholder="e.g. What canvas tips do you recommend?"
                      value={formData.question}
                      onChange={handleInputChange}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: borderColor },
                          minHeight: 48,
                          boxSizing: "border-box",
                        },
                      }}
                    />
                  </Box>

                  {/* PREDEFINED RESPONSE CONTENT */}
                  <Box display="flex" flexDirection="column" sx={{ height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1, textAlign: "left" }}>
                      <QAIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Predefined Answer
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      minRows={1}
                      maxRows={10}
                      name="answer"
                      placeholder="Provide detailed responses..."
                      value={formData.answer}
                      onChange={handleInputChange}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: borderColor },
                          minHeight: 48,
                          boxSizing: "border-box",
                          fontFamily: "monospace",
                          fontSize: "0.9rem",
                          bgcolor: darkMode ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.01)",
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>

                  {/* 3. ROUTING & BEHAVIOR */}
                  <Box display="flex" flexDirection="column" sx={{ height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1, textAlign: "left" }}>
                      <SchemaIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Reset Dialogue Tree
                      </Typography>
                    </Box>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        border: `1px solid ${borderColor}`,
                        bgcolor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                        display: "flex",
                        alignItems: "center",
                        height: 48,
                        boxSizing: "border-box",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isReset}
                            onChange={handleInputChange}
                            name="isReset"
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ textAlign: "left", ml: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              Reset Tree
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </Box>
                </Box>

                {/* ROW 2: FOLLOW-UPS, PDF, PHOTO, & VIDEO ATTACHMENTS */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                    gap: 3,
                    mb: 3,
                    width: "100%",
                  }}
                >
                  {/* FOLLOW-UP QUESTIONS */}
                  <Box display="flex" flexDirection="column" sx={{ height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1, textAlign: "left" }}>
                      <ChecklistIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Follow-Up Options
                      </Typography>
                    </Box>
                    <FormControl fullWidth size="small" disabled={formData.isReset}>
                      <Select
                        id="follow-ups-select"
                        multiple
                        value={formData.isReset ? [] : formData.followUps}
                        onChange={handleFollowUpsChange}
                        input={
                          <OutlinedInput 
                            sx={{ 
                              "& fieldset": { borderColor: borderColor }, 
                              minHeight: 48,
                              boxSizing: "border-box",
                            }} 
                          />
                        }
                        displayEmpty
                        renderValue={(selected) => {
                          if (formData.isReset) {
                              return <Typography color="text.secondary" variant="body2">N/A (Reset active)</Typography>;
                          }
                          if (!selected || selected.length === 0) {
                            return <Typography color="text.secondary" variant="body2">No follow-ups selected</Typography>;
                          }
                          return (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  size="small"
                                  sx={{
                                    bgcolor: darkMode ? "#c6ff00" : "#1976d2",
                                    color: darkMode ? "#000" : "#fff",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                  }}
                                />
                              ))}
                            </Box>
                          );
                        }}
                      >
                        {availableFlowIds.length === 0 ? (
                          <MenuItem disabled>No other flows available to link</MenuItem>
                        ) : (
                          availableFlowIds.map((id) => (
                            <MenuItem key={id} value={id}>
                              {id}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* PDF UPLOAD */}
                  <Box display="flex" flexDirection="column" sx={{ height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1, textAlign: "left" }}>
                      <PdfIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Upload PDF Guide
                      </Typography>
                    </Box>
                    {renderUploadWidget("pdf", "Choose PDF File", formData.pdfUrl, "application/pdf", <PdfIcon sx={{ fontSize: 18 }} />, "pdfUrl")}
                  </Box>

                  {/* PHOTO UPLOAD */}
                  <Box display="flex" flexDirection="column" sx={{ height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1, textAlign: "left" }}>
                      <PhotoIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Upload Photo Image
                      </Typography>
                    </Box>
                    {renderUploadWidget("photo", "Choose Photo", formData.photoUrl, "image/*", <PhotoIcon sx={{ fontSize: 18 }} />, "photoUrl")}
                  </Box>

                  {/* VIDEO UPLOAD */}
                  <Box display="flex" flexDirection="column" sx={{ height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1, textAlign: "left" }}>
                      <VideoIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Upload Video Clip
                      </Typography>
                    </Box>
                    {renderUploadWidget("video", "Choose Video", formData.videoUrl, "video/*", <VideoIcon sx={{ fontSize: 18 }} />, "videoUrl")}
                  </Box>
                </Box>

                {/* ROW 3: ACTIONS */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                    gap: 3,
                    width: "100%",
                  }}
                >
                  <Box display="flex" flexDirection="column" sx={{ height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1, textAlign: "left" }}>
                      <CompassIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Actions
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} sx={{ height: 48, alignItems: "center" }}>
                      <Button
                        type="submit"
                        disabled={loading}
                        variant="contained"
                        sx={{
                          flex: 1.5,
                          bgcolor: darkMode ? "#c6ff00" : "#1976d2",
                          color: darkMode ? "#000000" : "#ffffff",
                          fontWeight: 700,
                          height: 48,
                          borderRadius: 3,
                          textTransform: "none",
                          boxShadow: darkMode
                            ? "0 4px 14px rgba(198, 255, 0, 0.2)"
                            : "0 4px 14px rgba(25, 118, 210, 0.2)",
                          "&:hover": {
                            bgcolor: darkMode ? "#b2e600" : "#1565c0",
                            boxShadow: "none",
                          },
                        }}
                      >
                        {loading ? "Processing..." : editingId ? "Save" : "Create"}
                      </Button>

                      <Button
                        variant="contained"
                        onClick={resetForm}
                        sx={{
                          flex: 1,
                          bgcolor: "#ef4444",
                          color: "#ffffff",
                          borderRadius: 3,
                          height: 48,
                          textTransform: "none",
                          fontWeight: 700,
                          boxShadow: "0 4px 14px rgba(239, 68, 68, 0.2)",
                          "&:hover": {
                            bgcolor: "#dc2626",
                            boxShadow: "none",
                          },
                        }}
                      >
                        {editingId ? "Cancel" : "Clear"}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </form>
              </CardContent>
            </Card>
        </Box>

        {/* TABLE + SEARCH: uses AdminLayout's natural padding */}
        <Grid container spacing={4}>
          {/* RIGHT PANEL: SEARCH & COMPACT DIRECTORY LIST */}
          <Grid item xs={12}>
            {/* SEARCH AND CONTROL BAR */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 4,
                bgcolor: cardColor,
                border: `1px solid ${borderColor}`,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: "100%", sm: 380 },
                    zIndex: 10,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: darkMode ? "#0c1017" : "#fafafa",
                      borderRadius:
                        showSuggestions && filteredSuggestions.length > 0
                          ? "20px 20px 0 0"
                          : "50px",
                      px: 2.5,
                      py: 1,
                      border: `1px solid ${borderColor}`,
                      borderBottom:
                        showSuggestions && filteredSuggestions.length > 0
                          ? "none"
                          : `1px solid ${borderColor}`,
                      transition: "all 0.3s ease",
                      position: "relative",
                    }}
                  >
                    <SearchIcon sx={{ color: "text.secondary", mr: 1.5, fontSize: 20 }} />
                    <TextField
                      variant="standard"
                      placeholder="Search by ID, prompt, or answer..."
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      InputProps={{
                        disableUnderline: true,
                        style: { color: textColor, fontSize: "0.9rem" },
                      }}
                    />
                    {searchTerm && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSearchTerm("");
                          setShowSuggestions(false);
                        }}
                        sx={{ p: 0.5, ml: 1 }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {/* Search Suggestions Dropdown */}
                  {showSuggestions &&
                    searchTerm &&
                    filteredSuggestions.length > 0 && (
                      <Paper
                        elevation={4}
                        sx={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          bgcolor: darkMode ? "#0c1017" : "#fafafa",
                          border: `1px solid ${borderColor}`,
                          borderTop: "none",
                          borderRadius: "0 0 20px 20px",
                          overflow: "hidden",
                          maxHeight: 280,
                          overflowY: "auto",
                          zIndex: 9,
                        }}
                      >
                        <List disablePadding>
                          {filteredSuggestions.map((suggestion, index) => (
                            <React.Fragment key={suggestion.id}>
                              <ListItem disablePadding>
                                <ListItemButton
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  sx={{
                                    px: 2.5,
                                    py: 1.5,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    "&:hover": {
                                      bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                                    },
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 700,
                                      color: darkMode ? "#c6ff00" : "#1976d2",
                                      mb: 0.25,
                                      textAlign: "left",
                                    }}
                                  >
                                    {suggestion.id}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "text.secondary",
                                      textOverflow: "ellipsis",
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
                                      width: "100%",
                                      textAlign: "left",
                                    }}
                                  >
                                    {suggestion.question}
                                  </Typography>
                                </ListItemButton>
                              </ListItem>
                              {index < filteredSuggestions.length - 1 && (
                                <Divider sx={{ borderColor: borderColor }} />
                              )}
                            </React.Fragment>
                          ))}
                        </List>
                      </Paper>
                    )}
                </Box>
              </ClickAwayListener>

              <Box display="flex" alignItems="center" gap={1}>
                <ChecklistIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Showing {filteredFlows.length} of {flows.length} flows
                </Typography>
              </Box>
            </Box>

            {/* HIGHLY STRUCTURED TABLE DIRECTORY (DESKTOP VIEW) */}
            <TableContainer
              component={Paper}
              sx={{
                display: { xs: "none", lg: "block" },
                bgcolor: cardColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                boxShadow: "none",
                borderRadius: 4,
                maxHeight: 720,
                overflowY: "auto",
              }}
            >
              <Table stickyHeader sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        bgcolor: darkMode ? "#111520" : "#f8fafc",
                        color: textColor,
                        fontWeight: 700,
                        borderBottom: `2px solid ${borderColor}`,
                      }}
                    >
                      Flow ID
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: darkMode ? "#111520" : "#f8fafc",
                        color: textColor,
                        fontWeight: 700,
                        borderBottom: `2px solid ${borderColor}`,
                      }}
                    >
                      Question Prompt
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: darkMode ? "#111520" : "#f8fafc",
                        color: textColor,
                        fontWeight: 700,
                        borderBottom: `2px solid ${borderColor}`,
                        width: "40%",
                      }}
                    >
                      Predefined Response
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: darkMode ? "#111520" : "#f8fafc",
                        color: textColor,
                        fontWeight: 700,
                        borderBottom: `2px solid ${borderColor}`,
                      }}
                    >
                      Media Attachments
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: darkMode ? "#111520" : "#f8fafc",
                        color: textColor,
                        fontWeight: 700,
                        borderBottom: `2px solid ${borderColor}`,
                      }}
                    >
                      Submenus / Actions
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: darkMode ? "#111520" : "#f8fafc",
                        color: textColor,
                        fontWeight: 700,
                        borderBottom: `2px solid ${borderColor}`,
                      }}
                    >
                      Edit/Delete
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFlows.map((flow) => (
                    <TableRow
                      key={flow.id}
                      id={`flow-row-${flow.id}`}
                      hover
                      sx={{
                        transition: "background-color 0.2s ease",
                        "&:hover": {
                          bgcolor: darkMode ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.005)",
                        },
                      }}
                    >
                      <TableCell sx={{ borderBottom: `1px solid ${borderColor}`, color: textColor, py: 2 }}>
                        <Chip
                          label={flow.id}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontFamily: "monospace",
                            bgcolor: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                            color: textColor,
                            borderRadius: "6px",
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: `1px solid ${borderColor}`,
                          color: textColor,
                          fontWeight: 600,
                          py: 2,
                        }}
                      >
                        {flow.question}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: `1px solid ${borderColor}`,
                          color: textColor,
                          fontSize: "0.85rem",
                          whiteSpace: "pre-line",
                          lineHeight: 1.5,
                          py: 2,
                        }}
                      >
                        {flow.answer}
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${borderColor}`, color: textColor, py: 2 }}>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {flow.photoUrl && (
                            <Tooltip title={`Photo URL: ${flow.photoUrl}`}>
                              <Chip
                                icon={<PhotoIcon sx={{ "&&": { color: "#3b82f6", fontSize: 14 } }} />}
                                label="Photo"
                                size="small"
                                sx={{
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: "rgba(59, 130, 246, 0.08)",
                                  color: "#3b82f6",
                                  border: "1px solid rgba(59, 130, 246, 0.2)",
                                  cursor: "pointer",
                                }}
                                onClick={() => window.open(resolveMediaUrl(flow.photoUrl), "_blank")}
                              />
                            </Tooltip>
                          )}
                          {flow.videoUrl && (
                            <Tooltip title={`Video URL: ${flow.videoUrl}`}>
                              <Chip
                                icon={<VideoIcon sx={{ "&&": { color: "#10b981", fontSize: 14 } }} />}
                                label="Video"
                                size="small"
                                sx={{
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: "rgba(16, 185, 129, 0.08)",
                                  color: "#10b981",
                                  border: "1px solid rgba(16, 185, 129, 0.2)",
                                  cursor: "pointer",
                                }}
                                onClick={() => window.open(resolveMediaUrl(flow.videoUrl), "_blank")}
                              />
                            </Tooltip>
                          )}
                          {flow.pdfUrl && (
                            <Tooltip title={`PDF URL: ${flow.pdfUrl}`}>
                              <Chip
                                icon={<PdfIcon sx={{ "&&": { color: "#ef4444", fontSize: 14 } }} />}
                                label="PDF"
                                size="small"
                                sx={{
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: "rgba(239, 68, 68, 0.08)",
                                  color: "#ef4444",
                                  border: "1px solid rgba(239, 68, 68, 0.2)",
                                  cursor: "pointer",
                                }}
                                onClick={() => window.open(resolveMediaUrl(flow.pdfUrl), "_blank")}
                              />
                            </Tooltip>
                          )}
                          {!flow.photoUrl && !flow.videoUrl && !flow.pdfUrl && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                              -
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${borderColor}`, color: textColor, py: 2 }}>
                        {flow.isReset ? (
                          <Chip
                            icon={<ResetIcon sx={{ "&&": { color: "#ec4899", fontSize: 13 } }} />}
                            label="Resets Tree"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              bgcolor: "rgba(236,72,153,0.08)",
                              color: "#ec4899",
                              border: "1px solid rgba(236,72,153,0.2)",
                            }}
                          />
                        ) : flow.followUps && flow.followUps.length > 0 ? (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {flow.followUps.map((fu) => (
                              <Chip
                                key={fu}
                                label={fu}
                                size="small"
                                sx={{
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: darkMode ? "rgba(198,255,0,0.08)" : "rgba(25, 118, 210, 0.06)",
                                  color: darkMode ? "#c6ff00" : "#1976d2",
                                  border: `1px solid ${darkMode ? "rgba(198,255,0,0.15)" : "rgba(25, 118, 210, 0.1)"}`,
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                            Leaves dialogue tree
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: `1px solid ${borderColor}`, py: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          <Tooltip title="Edit Dialogue Flow">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(flow)}
                              sx={{
                                color: darkMode ? "#c6ff00" : "#1976d2",
                                bgcolor: darkMode ? "rgba(198,255,0,0.06)" : "rgba(25, 118, 210, 0.05)",
                                "&:hover": {
                                  bgcolor: darkMode ? "rgba(198,255,0,0.15)" : "rgba(25, 118, 210, 0.12)",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* We prevent deletion of 'main' menu flow to preserve system navigation fallback */}
                          <Tooltip title={flow.id === "main" ? "Cannot delete main root menu" : "Delete Dialogue Flow"}>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(flow.id)}
                              disabled={flow.id === "main"}
                              sx={{
                                color: theme.palette.error.main,
                                bgcolor: "rgba(211, 47, 47, 0.05)",
                                "&:hover": {
                                  bgcolor: "rgba(211, 47, 47, 0.15)",
                                },
                                "&.Mui-disabled": {
                                  color: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                                  bgcolor: "transparent",
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredFlows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          {flows.length === 0
                            ? "No predefined flows found. Seeding initial flows..."
                            : "No dialogue flows matched your search term."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* MOBILE & TABLET CARD DIRECTORY (MOBILE & TABLET VIEW) */}
            <Box
              sx={{
                display: { xs: "grid", lg: "none" },
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 2.5,
              }}
            >
              {filteredFlows.map((flow) => (
                <Card
                  key={flow.id}
                  id={`flow-card-${flow.id}`}
                  sx={{
                    bgcolor: cardColor,
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 4,
                    boxShadow: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: darkMode ? "#c6ff00" : "#1976d2",
                      boxShadow: darkMode
                        ? "0 4px 20px rgba(198, 255, 0, 0.08)"
                        : "0 4px 20px rgba(25, 118, 210, 0.08)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Header: Flow ID and Actions */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={flow.id}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontFamily: "monospace",
                          bgcolor: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                          color: textColor,
                          borderRadius: "6px",
                        }}
                      />
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Edit Dialogue Flow">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(flow)}
                            sx={{
                              color: darkMode ? "#c6ff00" : "#1976d2",
                              bgcolor: darkMode ? "rgba(198,255,0,0.06)" : "rgba(25, 118, 210, 0.05)",
                              "&:hover": {
                                bgcolor: darkMode ? "rgba(198,255,0,0.15)" : "rgba(25, 118, 210, 0.12)",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={flow.id === "main" ? "Cannot delete main root menu" : "Delete Dialogue Flow"}>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(flow.id)}
                            disabled={flow.id === "main"}
                            sx={{
                              color: theme.palette.error.main,
                              bgcolor: "rgba(211, 47, 47, 0.05)",
                              "&:hover": {
                                bgcolor: "rgba(211, 47, 47, 0.15)",
                              },
                              "&.Mui-disabled": {
                                color: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                                bgcolor: "transparent",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Question Prompt */}
                    <Box sx={{ textAlign: "left" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                        QUESTION PROMPT
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {flow.question}
                      </Typography>
                    </Box>

                    {/* Predefined Response */}
                    <Box sx={{ textAlign: "left" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                        PREDEFINED RESPONSE
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          border: `1px solid ${borderColor}`,
                          bgcolor: darkMode ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.01)",
                          maxHeight: 180,
                          overflowY: "auto",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.85rem",
                            whiteSpace: "pre-line",
                            lineHeight: 1.5,
                            fontFamily: "sans-serif",
                          }}
                        >
                          {flow.answer}
                        </Typography>
                      </Paper>
                    </Box>

                    {/* Media Attachments & Behavior */}
                    <Box display="flex" flexDirection="column" gap={1.5}>
                      {/* Media Attachments */}
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.75 }}>
                          MEDIA ATTACHMENTS
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                          {flow.photoUrl && (
                            <Chip
                              icon={<PhotoIcon sx={{ "&&": { color: "#3b82f6", fontSize: 13 } }} />}
                              label="Photo"
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor: "rgba(59, 130, 246, 0.08)",
                                color: "#3b82f6",
                                border: "1px solid rgba(59, 130, 246, 0.2)",
                                cursor: "pointer",
                              }}
                              onClick={() => window.open(resolveMediaUrl(flow.photoUrl), "_blank")}
                            />
                          )}
                          {flow.videoUrl && (
                            <Chip
                              icon={<VideoIcon sx={{ "&&": { color: "#10b981", fontSize: 13 } }} />}
                              label="Video"
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor: "rgba(16, 185, 129, 0.08)",
                                color: "#10b981",
                                border: "1px solid rgba(16, 185, 129, 0.2)",
                                cursor: "pointer",
                              }}
                              onClick={() => window.open(resolveMediaUrl(flow.videoUrl), "_blank")}
                            />
                          )}
                          {flow.pdfUrl && (
                            <Chip
                              icon={<PdfIcon sx={{ "&&": { color: "#ef4444", fontSize: 13 } }} />}
                              label="PDF"
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor: "rgba(239, 68, 68, 0.08)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                cursor: "pointer",
                              }}
                              onClick={() => window.open(resolveMediaUrl(flow.pdfUrl), "_blank")}
                            />
                          )}
                          {!flow.photoUrl && !flow.videoUrl && !flow.pdfUrl && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                              -
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Tree Navigation / Submenus */}
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.75 }}>
                          TREE BEHAVIOR / FOLLOW-UPS
                        </Typography>
                        {flow.isReset ? (
                          <Chip
                            icon={<ResetIcon sx={{ "&&": { color: "#ec4899", fontSize: 12 } }} />}
                            label="Resets Tree"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              bgcolor: "rgba(236,72,153,0.08)",
                              color: "#ec4899",
                              border: "1px solid rgba(236,72,153,0.2)",
                            }}
                          />
                        ) : flow.followUps && flow.followUps.length > 0 ? (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {flow.followUps.map((fu) => (
                              <Chip
                                key={fu}
                                label={fu}
                                size="small"
                                sx={{
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: darkMode ? "rgba(198,255,0,0.08)" : "rgba(25, 118, 210, 0.06)",
                                  color: darkMode ? "#c6ff00" : "#1976d2",
                                  border: `1px solid ${darkMode ? "rgba(198,255,0,0.15)" : "rgba(25, 118, 210, 0.1)"}`,
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                            Leaves dialogue tree
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {filteredFlows.length === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    gridColumn: "1 / -1",
                    py: 6,
                    bgcolor: cardColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 4,
                    textAlign: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    {flows.length === 0
                      ? "No predefined flows found. Seeding initial flows..."
                      : "No dialogue flows matched your search term."}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
    </Box>
  );
}
