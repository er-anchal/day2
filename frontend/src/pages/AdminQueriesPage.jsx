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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "./auth/AuthContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
          <TableContainer component={Paper} sx={{ bgcolor: cardColor, color: textColor, borderRadius: 2 }}>
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
