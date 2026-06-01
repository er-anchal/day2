import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useThemeContext } from "../context/ThemeContext";

export default function Categories({
  selectedCategory = null,
  searchText = "",
}) {
  const API_URL = import.meta.env.VITE_API_URL;
  const TEMP_URL = import.meta.env.VITE_TEMP_URL;

  const { darkMode, bgColor, cardColor, textColor, borderColor } =
    useThemeContext();

  const [categories, setCategories] = useState([]);
  const [templatesByCategory, setTemplatesByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_URL}/template-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let categoryData = res.data || [];

        if (selectedCategory?.slug) {
          categoryData = categoryData.filter(
            (cat) => cat.slug === selectedCategory.slug,
          );
        }

        setCategories(categoryData);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, [selectedCategory, token]);

  /* ---------------- FETCH TEMPLATES ---------------- */
  useEffect(() => {
    if (!categories.length || !token) {
      setLoading(false);
      return;
    }

    const fetchTemplates = async () => {
      try {
        const responses = await Promise.all(
          categories.map((cat) =>
            axios.get(`${API_URL}/templates/by-category/${cat.slug}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        );

        const grouped = {};
        responses.forEach((res, i) => {
          grouped[categories[i].slug] = res.data || [];
        });

        setTemplatesByCategory(grouped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [categories, token]);

  /* ---------------- SLIDER ---------------- */
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 900, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2 } },
    ],
  };

  const filterTemplates = (templates) => {
    if (!searchText.trim()) return templates;
    return templates.filter((t) =>
      (t.name || t.fileName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()),
    );
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!categories.length) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: cardColor,
          color: textColor,
        }}
      >
        <Typography>No categories found</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ px: 3, bgcolor: bgColor, color: textColor }}>
      {categories.map((category) => {
        const allTemplates = filterTemplates(
          templatesByCategory[category.slug] || [],
        );

        const grouped = {};

        allTemplates.forEach((t) => {
          const sub =
            t.subcategoryName ||
            t.subCategoryName ||
            t.subcategory?.name ||
            "Other";

          if (!grouped[sub]) grouped[sub] = [];
          grouped[sub].push(t);
        });

        if (!Object.keys(grouped).length) return null;

        return (
          <Box key={category._id} sx={{ mb: 6 }}>
            {/* CATEGORY TITLE */}
            <Typography
              variant="h5"
              fontWeight={700}
              mb={4}
              sx={{
                bgcolor: darkMode ? "#1e293b" : "#1976d2",
                color: "#fff",
                px: 3,
                py: 1,
                borderRadius: 2,
                display: "inline-block",
              }}
            >
              {category.name}
            </Typography>

            {/* SUBCATEGORIES */}
            {Object.entries(grouped).map(([sub, templates]) => (
              <Box
                key={sub}
                sx={{
                  px: 2,
                  py: 2,
                  "& .slick-prev:before, & .slick-next:before": {
                    color: darkMode ? "#90caf9" : "#1976d2",
                    fontSize: "25px",
                  },
                }}
              >
                {/* SUB TITLE */}
                <Typography
                  variant="h6"
                  fontWeight={600}
                  mb={2}
                  sx={{
                    color: textColor,
                    borderLeft: `4px solid ${darkMode ? "#90caf9" : "#1976d2"}`,
                    pl: 2,
                  }}
                >
                  {sub}
                </Typography>

                {/* SLIDER */}
                <Slider {...sliderSettings}>
                  {templates.map((t) => {
                    const imageUrl = `${TEMP_URL}/uploads/${t.categorySlug}/${t.subcategoryName}/${t.fileName}`;

                    return (
                      <Box key={t._id} sx={{ px: 1 }}>
                        <Box
                          onClick={() =>
                            navigate(`/template-shots/${t._id}`)
                          }
                          sx={{
                            height: 220,
                            borderRadius: 2,
                            overflow: "hidden",
                            cursor: "pointer",
                            bgcolor: cardColor,
                            border: `1px solid ${borderColor}`,
                            transition: "0.3s",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: 6,
                            },
                          }}
                        >
                          <Box
                            component="img"
                            src={imageUrl}
                            onError={(e) =>
                              (e.target.src = "/image/no-image.png")
                            }
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>

                        <Typography
                          mt={1}
                          textAlign="center"
                          noWrap
                          sx={{ color: textColor }}
                        >
                          {t.name || t.fileName}
                        </Typography>
                      </Box>
                    );
                  })}
                </Slider>
              </Box>
            ))}
          </Box>
        );
      })}
    </Box>
  );
}
