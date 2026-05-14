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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import axios from "axios";
import { useThemeContext } from "../context/ThemeContext";

export default function AdminPricingPage() {
  const { bgColor, textColor, cardColor, darkMode } = useThemeContext();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    subtitle: "",
    features: [""],
    recommended: false,
  });

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/subscription-plans");
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }                                                                                        
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeatureField = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeatureField = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan._id);
    setFormData({
      title: plan.title,
      price: plan.price,
      subtitle: plan.subtitle || "",
      features: plan.features.length ? plan.features : [""],
      recommended: plan.recommended || false,
    });
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      title: "",
      price: "",
      subtitle: "",
      features: [""],
      recommended: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (editingPlan) {
        await axios.put(`http://localhost:5000/api/subscription-plans/${editingPlan}`, formData, config);
        alert("Plan updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/subscription-plans", formData, config);
        alert("Plan created successfully");
      }
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Failed to save plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/subscription-plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Plan deleted successfully");
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Failed to delete plan");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: bgColor, color: textColor, py: { xs: 2, sm: 4 }, width: "100%" }}>
      <Container maxWidth="lg">
        <Typography variant="h4" mb={4} px={3} fontWeight="bold" textAlign="left">
          Manage Pricing Plans
        </Typography>

      {/* FORM SECTION */}
      <Box sx={{ maxWidth: 930, mx: "auto", mb: 6 }}>
        <Card sx={{ p: 2, bgcolor: cardColor, color: textColor }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              {editingPlan ? "Edit Plan" : "Add New Plan"}
            </Typography>
            <form onSubmit={handleSubmit}>
              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                  />
                </Box>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    label="Price (e.g., ₹999 or Custom)"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                  />
                </Box>
              </Box>
              <Box display="flex" gap={2} alignItems="center">
                <Box flex={1}>
                  <TextField
                    fullWidth
                    label="Subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Box>
                <Box flex={1} display="flex" alignItems="center" mt={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.recommended}
                        onChange={handleInputChange}
                        name="recommended"
                      />
                    }
                    label="Recommended Plan (Highlight)"
                    sx={{ whiteSpace: "nowrap" }}
                  />
                </Box>
              </Box>

              <Typography variant="subtitle1" fontWeight="bold" mt={2} mb={1}>
                Features
              </Typography>
              {formData.features.map((feature, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    required
                  />
                  <IconButton color="error" onClick={() => removeFeatureField(index)} disabled={formData.features.length === 1}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addFeatureField}
                variant="outlined"
                size="small"
                sx={{ mt: 1, mb: 3 }}
              >
                Add Feature
              </Button>

              <Box display="flex" gap={2} mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
                {editingPlan && (
                  <Button variant="outlined" color="secondary" onClick={resetForm} fullWidth>
                    Cancel Edit
                  </Button>
                )}
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>

      {/* LIST SECTION */}
      <Box>
        <Typography variant="h6" mb={2} textAlign="center">
          Existing Plans
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
          {plans.map((plan) => (
            <Card 
              key={plan._id}
              sx={{ 
                border: plan.recommended ? "2px solid #1976d2" : "1px solid #ccc",
                bgcolor: cardColor,
                color: textColor,
                width: 220, 
                height: 320,
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 1.5, "&:last-child": { pb: 1.5 } }}>
                {plan.recommended ? (
                  <Box mb={0.5}>
                    <Typography variant="caption" sx={{ bgcolor: "primary.main", color: "#fff", px: 1, py: 0.2, borderRadius: 1, fontSize: 9 }}>
                      Recommended
                    </Typography>
                  </Box>
                ) : (
                  <Box mb={0.5} sx={{ height: "16px" }} /> 
                )}
                <Typography variant="subtitle2" fontWeight="bold" lineHeight={1.2}>
                  {plan.title}
                </Typography>
                <Typography variant="subtitle1" color="primary" fontWeight="bold">
                  {plan.price}
                </Typography>
                <Typography color="text.secondary" mb={1} fontSize={11} lineHeight={1.2}>
                  {plan.subtitle}
                </Typography>
                <Divider sx={{ my: 0.5 }} />
                <ul style={{ paddingLeft: "16px", margin: 0, fontSize: "11px", flexGrow: 1, paddingBottom: "8px" }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ marginBottom: "2px" }}>{f}</li>
                  ))}
                </ul>
                <Box display="flex" justifyContent="space-between" mt="auto">
                  <Button variant="outlined" size="small" onClick={() => handleEdit(plan)} sx={{ fontSize: 11, py: 0.2 }}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(plan._id)} sx={{ fontSize: 11, py: 0.2 }}>
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
            {plans.length === 0 && (
              <Typography color="text.secondary" ml={2}>No plans found. Create one to get started.</Typography>
            )}
          </Box>
      </Box>
      </Container>
    </Box>
  );
}
