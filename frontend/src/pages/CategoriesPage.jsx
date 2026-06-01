import { useEffect, useState, useCallback } from "react";
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
  Card,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useAuth } from "../pages/auth/AuthContext";
import { useThemeContext } from "../context/ThemeContext";

const CategoriesPage = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const API_URL = import.meta.env.VITE_API_URL;
  const theme = useTheme();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // dialogs
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
  /* ---------------- FETCH ---------------- */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/template-categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(res.data);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load categories");
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ---------------- CREATE ---------------- */
  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Category name is required");

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/template-categories`,
        { name: trimmed },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setName("");
      fetchCategories();
      alert("Category saved successfully 🎉");
    } catch (err) {
      setError(err.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEditSave = async () => {
    // if (!editName.trim()) return;
    if (!editName.trim()) return alert("Category name is required");

    try {
      await axios.put(
        `${API_URL}/template-categories/${selected._id}`,
        { name: editName.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEditOpen(false);
      fetchCategories();
      alert("Category updated successfully 🎉");
    } catch (error) {
      // setError("Update failed");
      console.log(error.message || "Update failed");
      alert(error.message || "Update failed");
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/template-categories/${selected._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteOpen(false);
      fetchCategories();
      alert("Category deleted successfully 🎉");
    } catch (error) {
      console.log(error.message || "Delete failed");
      alert(error.message || "Delete failed");
    }
  };

  /* ---------------- UI ---------------- */
  return (

    <Box sx={{ px: 4, py: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2} textAlign={"center"}>
        Categories
      </Typography>

      {/* Create */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={3}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextField
            label="Category name"
            size="small"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={loading}
            sx={{ bgcolor: darkMode ? "#1e293b" : "#1976d2" }}
          >
            {loading ? <CircularProgress size={20} /> : "Add"}
          </Button>
        </Box>
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Paper>

      {/* Table */}
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
              sx={{
                backgroundColor: darkMode ? "#1e293b" : "#1976d2",
              }}
            >
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 600, color: "common.white", width: "75%" }}
                >
                  Name
                </TableCell>
                {/* <TableCell sx={{ fontWeight: 600, color: "common.white" }}>
                  Folder
                </TableCell> */}
                <TableCell sx={{ fontWeight: 600, color: "common.white" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat._id} hover>
                  <TableCell sx={{ color: textColor }}>{cat.name}</TableCell>
                  {/* <TableCell>{cat.slug}</TableCell> */}
                  <TableCell>
                    <Stack
                      spacing={0.5}
                      direction={{ xs: "column", sm: "row" }}
                    >
                      <IconButton
                        onClick={() => {
                          document.activeElement.blur();
                          setSelected(cat);
                          setEditName(cat.name);
                          setEditOpen(true);
                        }}
                        sx={{
                          backgroundColor: theme.palette.info.main, // blue
                          color: theme.palette.common.white, // icon color
                          "&:hover": {
                            backgroundColor: theme.palette.info.dark, // darker blue on hover
                          },
                          mr: 1, // margin between buttons
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          document.activeElement.blur();
                          setSelected(cat);
                          setDeleteOpen(true);
                        }}
                        sx={{
                          backgroundColor: theme.palette.error.main, // red
                          color: theme.palette.common.white, // icon color
                          "&:hover": {
                            backgroundColor: theme.palette.error.dark, // darker red on hover
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {!categories.length && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ color: textColor }}>
                    No categories found
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
          {!categories.length ? (
            <Box sx={{ py: 4, textAlign: "center", width: "100%", gridColumn: "1 / -1" }}>
              <Typography color="text.secondary">No categories found</Typography>
            </Box>
          ) : (
            categories.map((cat) => (
              <Card
                key={cat._id}
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
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  {cat.name}
                </Typography>

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
                      document.activeElement.blur();
                      setSelected(cat);
                      setEditName(cat.name);
                      setEditOpen(true);
                    }}
                    sx={{
                      backgroundColor: theme.palette.info.main,
                      color: theme.palette.common.white,
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
                      document.activeElement.blur();
                      setSelected(cat);
                      setDeleteOpen(true);
                    }}
                    sx={{
                      backgroundColor: theme.palette.error.main,
                      color: theme.palette.common.white,
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
            ))
          )}
        </Box>
      </Paper>

      {/* EDIT DIALOG */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            id="edit-category-input"
            fullWidth
            label="Category name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 1 }}
            autoFocus
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
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selected?.name}</strong>?
          </Typography>
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

export default CategoriesPage;
