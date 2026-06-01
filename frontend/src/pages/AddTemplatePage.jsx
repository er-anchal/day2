import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../pages/auth/AuthContext";

const AddTemplatePage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  // Separate states for template images and shot images
  const [templateFiles, setTemplateFiles] = useState([]);
  const [shotFiles, setShotFiles] = useState([]);

  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/template-categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(res.data || []);
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

  /* ---------------- FETCH SUBCATEGORIES ---------------- */
  const fetchSubCategories = async (categoryId) => {
    try {
      const res = await axios.get(
        `${API_URL}/template-subcategories/category/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSubCategories(res.data || []);
    } catch (err) {
      console.error("Subcategory fetch error:", err);
    }
  };

  /* ---------------- CATEGORY CHANGE ---------------- */
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedSubCategory("");
    setSubCategories([]);

    if (value) {
      fetchSubCategories(value);
    }
  };

  /* ---------------- FILE CHANGE ---------------- */
  const handleTemplateChange = (e) => {
    setTemplateFiles(Array.from(e.target.files));
  };

  // Replace this function in AddTemplatePage.jsx

  const handleShotChange = (e) => {
    // Only allow one shot image
    const file = e.target.files[0];

    if (file) {
      setShotFiles([file]); // store as array with single file
    } else {
      setShotFiles([]);
    }
  };

  /* ---------------- UPLOAD ---------------- */
  const handleUpload = async () => {
    if (!selectedCategory) {
      alert("Select category");
      return;
    }

    if (!selectedSubCategory) {
      alert("Select subcategory");
      return;
    }

    // At least one template image is required
    if (templateFiles.length === 0) {
      alert("Select at least one template image");
      return;
    }

    const formData = new FormData();

    // Required fields
    formData.append("categoryId", selectedCategory);
    formData.append("subCategoryId", selectedSubCategory);

    // Template images
    templateFiles.forEach((file) => {
      formData.append("images", file);
    });

    // Optional shot image
    if (shotFiles.length > 0) {
      formData.append("shots", shotFiles[0]); // single shot image
    }

    // Decide API based on whether shot image is selected
    const uploadUrl =
      shotFiles.length > 0
        ? `${API_URL}/template-shots/upload`
        : `${API_URL}/subcategories/upload`;

    try {
      setLoading(true);

      await axios.post(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Uploaded successfully 🎉");
      navigate("/");
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3} textAlign={"center"}>
        Add Templates
      </Typography>

      <Paper sx={{ p: 3, width: "100%" }}>
        {/* CATEGORY */}
        <Box display="flex" gap={2} mb={3}>
          {/* CATEGORY */}
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* SUBCATEGORY */}
          <FormControl fullWidth disabled={!selectedCategory}>
            <InputLabel>SubCategory</InputLabel>
            <Select
              value={selectedSubCategory}
              label="SubCategory"
              onChange={(e) => setSelectedSubCategory(e.target.value)}
            >
              {subCategories.map((sub) => (
                <MenuItem key={sub._id} value={sub._id}>
                  {sub.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>{" "}
        {/* TEMPLATE IMAGE UPLOAD */}
        <Box mb={3}>
          <Button variant="contained" component="label">
            Select Template Images
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleTemplateChange}
            />
          </Button>

          {templateFiles.length > 0 && (
            <Typography mt={1} variant="body2">
              {templateFiles.length} template image(s) selected
            </Typography>
          )}
        </Box>
        {/* SHOT IMAGE UPLOAD (OPTIONAL) */}
        {/* Replace the Shot Image Upload section */}
        <Box mb={3}>
          <Button variant="outlined" component="label">
            Select Shot Image (Optional)
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleShotChange}
            />
          </Button>

          {shotFiles.length > 0 && (
            <Typography mt={1} variant="body2">
              Selected shot: {shotFiles[0].name}
            </Typography>
          )}
        </Box>
        {/* UPLOAD BUTTON */}
        <Box mt={3}>
          <Button variant="contained" onClick={handleUpload} disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddTemplatePage;
