import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Stack,
  MenuItem,
  Card,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../pages/auth/AuthContext";
import { useThemeContext } from "../context/ThemeContext";

const SubCategoryAdmin = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const API_URL = import.meta.env.VITE_API_URL;
  const theme = useTheme();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- dialogs ---------------- */
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editName, setEditName] = useState("");
  const {
    darkMode,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();
  /* ---------------- FETCH CATEGORIES ---------------- */
  const fetchCategories = useCallback(async () => {
    const res = await axios.get(`${API_URL}/template-categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCategories(res.data);
  }, [API_URL, token]);

  /* ---------------- FETCH SUBCATEGORIES ---------------- */
  const fetchSubCategories = useCallback(async () => {
    const res = await axios.get(`${API_URL}/template-subcategories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSubCategories(res.data);
  }, [API_URL, token]);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, [fetchCategories, fetchSubCategories]);

  /* ---------------- CREATE ---------------- */
  const handleCreate = async () => {
    const trimmed = form.name.trim();
    if (!trimmed || !form.categoryId) return;

    try {
      setLoading(true);

      await axios.post(`${API_URL}/template-subcategories`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm({ name: "", categoryId: "" });
      fetchSubCategories();
      alert("SubCategory created 🎉");
    } catch (err) {
      setError(err.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UPDATE ---------------- */
  const handleEditSave = async () => {
    try {
      await axios.put(
        `${API_URL}/template-subcategories/${selected._id}`,
        { name: editName },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setEditOpen(false);
      fetchSubCategories();
      alert("Updated 🎉");
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/template-subcategories/${selected._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDeleteOpen(false);
      fetchSubCategories();
      alert("Deleted 🎉");
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  /* ---------------- UI ---------------- */
  return (

    <Box sx={{ px: 4, py: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2} textAlign={"center"}>
        SubCategories
      </Typography>

      {/* CREATE FORM */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={3}>
        <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
          <TextField
            id="subcategory-name"
            label="SubCategory Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
          />

          <TextField
            id="select-category"
            select
            label="Select Category"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            fullWidth
          >
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={loading}
            sx={{ minWidth: 120, bgcolor: darkMode ? "#1e293b" : "#1976d2" }}
          >
            {loading ? <CircularProgress size={20} /> : "Add"}
          </Button>
        </Stack>

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Paper>

      {/* TABLE */}
      <Paper
        sx={{
          p: 2,
          bgcolor: cardColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
        elevation={darkMode ? 0 : 3}
      >
        <TableContainer sx={{ display: { xs: "none", lg: "block" } }}>
          <Table
            sx={{
              border: "1px solid",
              borderColor: "divider",
              "& th, & td": {
                border: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            <TableHead
              sx={{ backgroundColor: darkMode ? "#1e293b" : "#1976d2" }}
            >
              <TableRow>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 600, width: "40%" }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 600, width: "40%" }}
                >
                  Category
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600, width: "20%" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {subCategories.map((sub) => {
                const cat = categories.find((c) => c._id === sub.categoryId);

                return (
                  <TableRow key={sub._id} hover>
                    <TableCell sx={{ color: textColor }}>{sub.name}</TableCell>
                    <TableCell sx={{ color: textColor }}>{cat?.name || "Unknown"}</TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          sx={{
                            backgroundColor: theme.palette.info.main,
                            color: "#fff",
                            "&:hover": {
                              backgroundColor: theme.palette.info.dark,
                            },
                          }}
                          onClick={() => {
                            setSelected(sub);
                            setEditName(sub.name);
                            setEditOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          sx={{
                            backgroundColor: theme.palette.error.main,
                            color: "#fff",
                            "&:hover": {
                              backgroundColor: theme.palette.error.dark,
                            },
                          }}
                          onClick={() => {
                            setSelected(sub);
                            setDeleteOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!subCategories.length && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ color: textColor }}>
                    No subcategories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* MOBILE & TABLET CARD VIEW */}
        <Box
          sx={{
            display: { xs: "grid", lg: "none" },
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {!subCategories.length ? (
            <Box sx={{ py: 4, textAlign: "center", width: "100%", gridColumn: "1 / -1" }}>
              <Typography color="text.secondary">No subcategories found</Typography>
            </Box>
          ) : (
            subCategories.map((sub) => {
              const cat = categories.find((c) => c._id === sub.categoryId);

              return (
                <Card
                  key={sub._id}
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
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    p: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "6px",
                        bgcolor: darkMode ? "rgba(198, 255, 0, 0.1)" : "rgba(25, 118, 210, 0.08)",
                        color: darkMode ? "#c6ff00" : "#1976d2",
                        fontFamily: "monospace",
                        alignSelf: "flex-start",
                      }}
                    >
                      {cat?.name || "Unknown Category"}
                    </Typography>

                    <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
                      {sub.name}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1.5,
                      borderTop: `1px solid ${borderColor}`,
                      pt: 1.5,
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        setSelected(sub);
                        setEditName(sub.name);
                        setEditOpen(true);
                      }}
                      sx={{
                        backgroundColor: theme.palette.info.main,
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: theme.palette.info.dark,
                          transform: "scale(1.05)",
                        },
                        transition: "transform 0.2s, background-color 0.2s",
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelected(sub);
                        setDeleteOpen(true);
                      }}
                      sx={{
                        backgroundColor: theme.palette.error.main,
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: theme.palette.error.dark,
                          transform: "scale(1.05)",
                        },
                        transition: "transform 0.2s, background-color 0.2s",
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              );
            })
          )}
        </Box>
      </Paper>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit SubCategory</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete SubCategory</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{selected?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubCategoryAdmin;
