import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Card,
  CardContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "./auth/AuthContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const AdminQueriesPage = () => {
  const { bgColor, textColor, cardColor, borderColor, darkMode } = useThemeContext();
  const { token } = useAuth();

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/user-queries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setQueries(data.data);
      }
    } catch (error) {
      console.error("Error fetching queries", error);
      setToast({ open: true, message: "Failed to fetch queries", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    if (currentStatus === "Resolved") return;
    
    try {
      await axios.put(`${API_BASE_URL}/user-queries/${id}`, { status: "Resolved" }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ open: true, message: "Query marked as resolved", severity: "success" });
      fetchQueries();
    } catch (error) {
      setToast({ open: true, message: "Error updating query", severity: "error" });
    }
  };

  const handleDeleteQuery = async (id) => {
    if (window.confirm("Are you sure you want to delete this query?")) {
      try {
        await axios.delete(`${API_BASE_URL}/user-queries/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToast({ open: true, message: "Query deleted successfully", severity: "success" });
        fetchQueries();
      } catch (error) {
        setToast({ open: true, message: "Error deleting query", severity: "error" });
      }
    }
  };

  const filteredQueries = queries.filter(q => 
    q.name.toLowerCase().includes(search.toLowerCase()) || 
    q.email.toLowerCase().includes(search.toLowerCase()) ||
    q.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: bgColor, color: textColor, p: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h4" fontWeight={700}>
            User Queries
          </Typography>
          <TextField
            placeholder="Search queries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              style: { color: textColor },
            }}
            sx={{ 
                bgcolor: cardColor, 
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor },
                } 
            }}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
             <CircularProgress />
          </Box>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <TableContainer
              component={Paper}
              sx={{
                display: { xs: "none", lg: "block" },
                bgcolor: cardColor,
                color: textColor,
                borderRadius: 2,
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: darkMode ? "#1e293b" : "#f1f5f9" }}>
                  <TableRow>
                    <TableCell sx={{ color: textColor, fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ color: textColor, fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ color: textColor, fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ color: textColor, fontWeight: "bold" }}>Phone</TableCell>
                    <TableCell sx={{ color: textColor, fontWeight: "bold", width: "30%" }}>Message</TableCell>
                    <TableCell sx={{ color: textColor, fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ color: textColor, fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQueries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ color: textColor, py: 3 }}>
                        No queries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQueries.map((query) => (
                      <TableRow key={query._id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell sx={{ color: textColor }}>{new Date(query.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ color: textColor }}>{query.name}</TableCell>
                        <TableCell sx={{ color: textColor }}>{query.email}</TableCell>
                        <TableCell sx={{ color: textColor }}>{query.phone || "N/A"}</TableCell>
                        <TableCell sx={{ color: textColor }}>
                           <Typography variant="body2" sx={{ 
                               display: '-webkit-box',
                               WebkitLineClamp: 2,
                               WebkitBoxOrient: 'vertical',
                               overflow: 'hidden',
                               textOverflow: 'ellipsis'
                           }}>
                              {query.message}
                           </Typography>
                        </TableCell>
                        <TableCell sx={{ color: textColor }}>
                           <Typography variant="caption" sx={{ 
                               px: 1, py: 0.5, borderRadius: 1, 
                               bgcolor: query.status === "Resolved" ? "#10b98120" : "#f59e0b20", 
                               color: query.status === "Resolved" ? "#10b981" : "#f59e0b" 
                            }}>
                             {query.status}
                           </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                             color="success" 
                             onClick={() => handleUpdateStatus(query._id, query.status)}
                             disabled={query.status === "Resolved"}
                             title="Mark as Resolved"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteQuery(query._id)} title="Delete Query">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* MOBILE & TABLET USER QUERY CARDS */}
            <Box
              sx={{
                display: { xs: "grid", lg: "none" },
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 3,
              }}
            >
              {filteredQueries.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    gridColumn: "1 / -1",
                    py: 6,
                    bgcolor: cardColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography color="text.secondary">No queries found.</Typography>
                </Paper>
              ) : (
                filteredQueries.map((query) => (
                  <Card
                    key={query._id}
                    sx={{
                      bgcolor: cardColor,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 3,
                      boxShadow: "none",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
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
                    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {new Date(query.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1.25,
                            py: 0.5,
                            borderRadius: "4px",
                            fontWeight: 600,
                            bgcolor: query.status === "Resolved" ? "#10b98120" : "#f59e0b20",
                            color: query.status === "Resolved" ? "#10b981" : "#f59e0b",
                          }}
                        >
                          {query.status}
                        </Typography>
                      </Box>

                      <Box display="flex" flexDirection="column" gap={0.75}>
                        <Box display="flex" gap={1}>
                          <Typography variant="body2" fontWeight={700} color="text.secondary">
                            From:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {query.name}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                          <Typography variant="body2" fontWeight={700} color="text.secondary">
                            Email:
                          </Typography>
                          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                            {query.email}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                          <Typography variant="body2" fontWeight={700} color="text.secondary">
                            Phone:
                          </Typography>
                          <Typography variant="body2">
                            {query.phone || "N/A"}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          MESSAGE
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${borderColor}`,
                            bgcolor: darkMode ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.01)",
                            maxHeight: 140,
                            overflowY: "auto",
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: "pre-line", fontSize: "0.85rem", lineHeight: 1.5 }}>
                            {query.message}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        p: 1.5,
                        borderTop: `1px solid ${borderColor}`,
                        display: "flex",
                        gap: 1.5,
                        bgcolor: darkMode ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.005)",
                      }}
                    >
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => handleUpdateStatus(query._id, query.status)}
                        disabled={query.status === "Resolved"}
                        startIcon={<CheckCircleIcon />}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderColor: darkMode ? "rgba(198, 255, 0, 0.4)" : "rgba(16, 185, 129, 0.4)",
                          color: query.status === "Resolved"
                            ? "text.disabled"
                            : (darkMode ? "#c6ff00" : "#10b981"),
                          "&:hover": {
                            borderColor: darkMode ? "#c6ff00" : "#10b981",
                            bgcolor: darkMode ? "rgba(198, 255, 0, 0.08)" : "rgba(16, 185, 129, 0.08)",
                          },
                          "&.Mui-disabled": {
                            borderColor: "transparent",
                            bgcolor: "transparent",
                            color: "text.disabled",
                          }
                        }}
                      >
                        {query.status === "Resolved" ? "Resolved" : "Resolve"}
                      </Button>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteQuery(query._id)}
                        startIcon={<DeleteIcon />}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          "&:hover": {
                            bgcolor: "rgba(211, 47, 47, 0.08)",
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Card>
                ))
              )}
            </Box>
          </>
        )}

        <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
          <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminQueriesPage;
