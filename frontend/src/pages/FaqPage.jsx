import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  ClickAwayListener,
  Dialog,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useThemeContext } from "../context/ThemeContext";
// import Navbar from "../components/Navbar"; // User removed Navbar in last edit
import Footer from "../components/Footer";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const categories = [
  "All",
  "General",
  "Product Shoot",
  "Pricing",
  "Jewellery",
  "Images & Videos",
  "Account & Usage",
];

const FaqAccordionItem = ({
  faq,
  expanded,
  onChange,
  greenAccent,
  borderColor,
  cardColor,
  textColor,
  darkMode,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  let visibleCount = 4;
  if (isMobile) visibleCount = 1;
  else if (isTablet) visibleCount = 2;

  const [startIndex, setStartIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const handlePrevSwiper = (e) => {
    e.stopPropagation();
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextSwiper = (e) => {
    e.stopPropagation();
    setStartIndex((prev) =>
      Math.min(faq.images.length - visibleCount, prev + 1),
    );
  };

  const openPreview = (e, index = 0) => {
    e.stopPropagation();
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const closePreview = (e) => {
    e.stopPropagation();
    setPreviewOpen(false);
  };

  const handlePrevPreview = (e) => {
    e.stopPropagation();
    setPreviewIndex((prev) => (prev > 0 ? prev - 1 : faq.images.length - 1));
  };

  const handleNextPreview = (e) => {
    e.stopPropagation();
    setPreviewIndex((prev) => (prev < faq.images.length - 1 ? prev + 1 : 0));
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank");
  };

  const API_DOMAIN = API_BASE_URL.replace("/api", "");

  return (
    <>
      <Accordion
        expanded={expanded}
        onChange={onChange}
        sx={{
          bgcolor: cardColor,
          color: textColor,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px !important",
          border: `1px solid ${expanded ? greenAccent : borderColor}`,
          boxShadow: expanded ? `0 0 10px ${greenAccent}40` : "none",
          "&:before": { display: "none" },
          transition: "all 0.3s ease",
          overflow: "hidden",
          "&:hover": {
            border: `1px solid ${greenAccent}`,
            boxShadow: `0 0 10px ${greenAccent}40`,
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: textColor }} />}
          sx={{ p: 3 }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "black",
                bgcolor: `${greenAccent}40`,
                px: 1.5,
                py: 0.5,
                borderRadius: "4px",
                fontWeight: 700,
                textTransform: "uppercase",
                mb: 1.5,
                display: "inline-block",
              }}
            >
              {faq.category}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {faq.title}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.8, mb: 3 }}
          >
            {faq.answer}
          </Typography>

          {/* Media Container Row */}
          {(faq.images?.length > 0 || faq.video || faq.pdf) && (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                alignItems: "stretch",
              }}
            >
              {/* Small Swiper (Up to 4 images) */}
              {faq.images && faq.images.length > 0 && (
                <Box
                  sx={{
                    flex: 1,
                    position: "relative",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: `1px solid ${borderColor}`,
                    bgcolor: darkMode ? "#000" : "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      p: 2,
                      gap: 2,
                      position: "relative",
                      flexGrow: 1,
                      height: "200px",
                    }}
                  >
                    {faq.images.length > visibleCount && startIndex > 0 && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handlePrevSwiper}
                        startIcon={<ChevronLeftIcon />}
                        sx={{
                          position: "absolute",
                          left: 8,
                          zIndex: 2,
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
                          textTransform: "none",
                        }}
                      >
                        Prev
                      </Button>
                    )}

                    {/* Visible Images */}
                    {faq.images
                      .slice(startIndex, startIndex + visibleCount)
                      .map((img, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            flex: 1,
                            height: "100%",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          onClick={(e) => openPreview(e, startIndex + idx)}
                        >
                          <img
                            src={`${API_DOMAIN}${img}`}
                            alt={`FAQ Step ${startIndex + idx + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: `1px solid ${borderColor}`,
                            }}
                          />
                        </Box>
                      ))}

                    {faq.images.length > visibleCount &&
                      startIndex < faq.images.length - visibleCount && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleNextSwiper}
                          endIcon={<ChevronRightIcon />}
                          sx={{
                            position: "absolute",
                            right: 8,
                            zIndex: 2,
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
                            textTransform: "none",
                          }}
                        >
                          Next
                        </Button>
                      )}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      bgcolor: darkMode
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                      {faq.images.length} Image(s) Attached
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => openPreview(e, 0)}
                      sx={{
                        color: textColor,
                        borderColor: borderColor,
                        textTransform: "none",
                      }}
                    >
                      Preview Images
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Video Player */}
              {faq.video && (
                <Box
                  sx={{
                    flex: 1,
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: `1px solid ${borderColor}`,
                    bgcolor: darkMode ? "#000" : "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      flexGrow: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "200px",
                    }}
                  >
                    <video
                      controls
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        backgroundColor: "#000",
                        borderRadius: "8px",
                      }}
                      src={`${API_DOMAIN}${faq.video}`}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      bgcolor: darkMode
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                      Video Attachment
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openInNewTab(`${API_DOMAIN}${faq.video}`)}
                      sx={{
                        color: textColor,
                        borderColor: borderColor,
                        textTransform: "none",
                      }}
                    >
                      Preview Video
                    </Button>
                  </Box>
                </Box>
              )}

              {/* PDF Link */}
              {faq.pdf && (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 3,
                    gap: 2,
                    borderRadius: "12px",
                    border: `1px solid ${borderColor}`,
                    bgcolor: darkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <PictureAsPdfIcon sx={{ color: greenAccent, fontSize: 40 }} />
                    <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                      PDF Document Attached
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => openInNewTab(`${API_DOMAIN}${faq.pdf}`)}
                    sx={{
                      bgcolor: greenAccent,
                      color: "#000",
                      "&:hover": { bgcolor: "#b3e600" },
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    View PDF
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Fullscreen Image Preview Dialog (1 Image at a time) */}
      <Dialog
        fullScreen
        open={previewOpen}
        onClose={closePreview}
        PaperProps={{ sx: { bgcolor: "rgba(0,0,0,0.95)", color: "#fff" } }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            Image Preview ({previewIndex + 1}/{faq.images?.length || 0})
          </Typography>
          <Button
            onClick={closePreview}
            sx={{ color: "#fff", border: "1px solid #fff" }}
          >
            Close Preview
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            position: "relative",
            p: 2,
          }}
        >
          {faq.images && faq.images.length > 1 && (
            <Button
              variant="contained"
              size="large"
              onClick={handlePrevPreview}
              startIcon={<ChevronLeftIcon />}
              sx={{
                position: "absolute",
                left: 20,
                zIndex: 2,
                bgcolor: "rgba(255,255,255,0.1)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                textTransform: "none",
              }}
            >
              Prev
            </Button>
          )}
          {faq.images && faq.images.length > 0 && (
            <img
              src={`${API_DOMAIN}${faq.images[previewIndex]}`}
              alt={`FAQ Step ${previewIndex + 1} Fullscreen`}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )}
          {faq.images && faq.images.length > 1 && (
            <Button
              variant="contained"
              size="large"
              onClick={handleNextPreview}
              endIcon={<ChevronRightIcon />}
              sx={{
                position: "absolute",
                right: 20,
                zIndex: 2,
                bgcolor: "rgba(255,255,255,0.1)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                textTransform: "none",
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Dialog>
    </>
  );
};

const FaqPage = () => {
  const { bgColor, textColor, cardColor, borderColor, darkMode } =
    useThemeContext();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [allFaqsForSearch, setAllFaqsForSearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const [expandedId, setExpandedId] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const greenAccent = "#c6ff00";

  useEffect(() => {
    fetchAllFaqsForSearch();
    fetchFaqs();
  }, [activeCategory]);

  const fetchAllFaqsForSearch = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/faqs`);
      if (data.success) {
        setAllFaqsForSearch(data.data);
      }
    } catch (error) {
      console.error("Error fetching all FAQs", error);
    }
  };

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/faqs?`;
      if (activeCategory !== "All")
        url += `category=${encodeURIComponent(activeCategory)}&`;

      const { data } = await axios.get(url);
      if (data.success) {
        setFaqs(data.data);
      }
    } catch (error) {
      console.error("Error fetching FAQs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpandedId(isExpanded ? panel : false);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/user-queries`,
        formData,
      );
      if (data.success) {
        setToast({
          open: true,
          message: "Your query has been submitted successfully!",
          severity: "success",
        });
        setFormData({ name: "", email: "", phone: "", message: "" });
      }
    } catch (error) {
      setToast({
        open: true,
        message:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      color: textColor,
      bgcolor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
      borderRadius: "12px",
      transition: "all 0.3s ease",
      "& fieldset": {
        borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      },
      "&:hover fieldset": {
        borderColor: "rgba(198, 255, 0, 0.4)",
      },
      "&.Mui-focused fieldset": {
        borderColor: greenAccent,
        borderWidth: "1px",
      },
      "&.Mui-focused": {
        boxShadow: `0 0 15px ${greenAccent}20`,
      },
    },
    "& .MuiInputLabel-root": { color: "text.secondary" },
    "& .MuiInputLabel-root.Mui-focused": { color: greenAccent },
  };

  // Amazon-style live search suggestions logic
  const filteredSuggestions = allFaqsForSearch
    .filter((faq) => {
      const q = searchQuery.toLowerCase();
      if (!q) return false;
      return (
        (faq.title && faq.title.toLowerCase().includes(q)) ||
        (faq.shortDescription &&
          faq.shortDescription.toLowerCase().includes(q)) ||
        (faq.answer && faq.answer.toLowerCase().includes(q))
      );
    })
    .slice(0, 5);

  const handleSuggestionClick = (faq) => {
    setSearchQuery("");
    setShowSuggestions(false);
    setActiveCategory(faq.category);
    setExpandedId(faq._id);
    setTimeout(() => {
      const element = document.getElementById(`faq-${faq._id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 500);
  };

  // Render using standard Grid 12-column layout (Grid-6 for half-width)
  const renderFaqsGrid = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 5,
            width: "100%",
          }}
        >
          <CircularProgress sx={{ color: greenAccent }} />
        </Box>
      );
    }

    if (faqs.length === 0) {
      return (
        <Typography
          textAlign="center"
          color="text.secondary"
          sx={{ width: "100%" }}
        >
          No FAQs found for this category.
        </Typography>
      );
    }

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          columnGap: 4,
          rowGap: 3,
          alignItems: "start",
        }}
      >
        {faqs.map((faq, index) => {
          let itemOrder = index;
          
          // If the expanded item is on the right side (odd index), it should visually swap
          // with the left item to prevent leaving an empty space.
          if (expandedId === faq._id && index % 2 !== 0) {
            itemOrder = index - 1;
          } else if (index % 2 === 0 && index + 1 < faqs.length && faqs[index + 1]._id === expandedId) {
            itemOrder = index + 1;
          }

          return (
            <Box 
              key={faq._id} 
              id={`faq-${faq._id}`}
              sx={{
                gridColumn: expandedId === faq._id ? "1 / -1" : "auto",
                height: "100%",
                // Apply the order swap only on desktop (md and above)
                order: { xs: index, md: itemOrder },
              }}
            >
              <FaqAccordionItem
                faq={faq}
                expanded={expandedId === faq._id}
                onChange={handleChange(faq._id)}
                greenAccent={greenAccent}
                borderColor={borderColor}
                cardColor={cardColor}
                textColor={textColor}
                darkMode={darkMode}
              />
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: bgColor, color: textColor }}>
      <Box sx={{ pt: "50px", pb: 12, px: { xs: 2, md: 5 } }}>
        <Container maxWidth={false} sx={{ maxWidth: "1400px" }}>
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: greenAccent,
                fontWeight: 700,
                letterSpacing: 1.5,
                mb: 2,
                textTransform: "uppercase",
              }}
            >
              Help Center
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Frequently Asked Questions
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                mb: 4,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Find answers about AIVX, jewellery product shoots, pricing, and
              usage.
            </Typography>

            {/* Live Search Bar */}
            <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
              <Box
                sx={{
                  position: "relative",
                  maxWidth: "600px",
                  mx: "auto",
                  mb: 6,
                }}
                ref={searchRef}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: darkMode ? "#1A2027" : "#fff",
                    borderRadius:
                      showSuggestions && filteredSuggestions.length > 0
                        ? "24px 24px 0 0"
                        : "50px",
                    px: 3,
                    py: 1,
                    width: "100%",
                    border: `1px solid ${borderColor}`,
                    borderBottom:
                      showSuggestions && filteredSuggestions.length > 0
                        ? "none"
                        : `1px solid ${borderColor}`,
                    transition: "all 0.3s ease",
                    zIndex: 10,
                    position: "relative",
                  }}
                >
                  <SearchIcon sx={{ color: "text.secondary", mr: 2 }} />
                  <TextField
                    variant="standard"
                    placeholder="Search for answers..."
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    InputProps={{
                      disableUnderline: true,
                      style: { color: textColor },
                    }}
                  />
                </Box>

                {/* Search Suggestions Dropdown */}
                {showSuggestions &&
                  searchQuery &&
                  filteredSuggestions.length > 0 && (
                    <Paper
                      elevation={4}
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        bgcolor: darkMode ? "#1A2027" : "#fff",
                        border: `1px solid ${borderColor}`,
                        borderTop: "none",
                        borderRadius: "0 0 24px 24px",
                        overflow: "hidden",
                        zIndex: 9,
                      }}
                    >
                      <List disablePadding>
                        {filteredSuggestions.map((suggestion, index) => (
                          <React.Fragment key={suggestion._id}>
                            <ListItem disablePadding>
                              <ListItemButton
                                onClick={() =>
                                  handleSuggestionClick(suggestion)
                                }
                                sx={{ px: 3, py: 2 }}
                              >
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 600, color: textColor }}
                                  >
                                    {suggestion.title}
                                  </Typography>
                                </Box>
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

            {/* Category Pills */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 2,
                mb: 6,
              }}
            >
              {categories.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  sx={{
                    borderRadius: "50px",
                    px: 3,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor:
                      activeCategory === cat
                        ? greenAccent
                        : darkMode
                          ? "#1A2027"
                          : "#e2e8f0",
                    color: activeCategory === cat ? "#000" : textColor,
                    "&:hover": {
                      bgcolor:
                        activeCategory === cat
                          ? greenAccent
                          : darkMode
                            ? "#2D3748"
                            : "#cbd5e1",
                    },
                    boxShadow:
                      activeCategory === cat
                        ? `0 0 15px ${greenAccent}80`
                        : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {cat}
                </Button>
              ))}
            </Box>
          </Box>

          {/* 2-Column FAQ Layout (Grid-6) */}
          <Box sx={{ mb: 10 }}>{renderFaqsGrid()}</Box>

          {/* Ask Question Form */}
          <Box
            sx={{
              bgcolor: cardColor,
              p: { xs: 3, md: 5 },
              borderRadius: "24px",
              border: `1px solid ${borderColor}`,
              mx: "auto",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 6, md: 8 }, justifyContent: "space-between" }}>
              {/* Left Side: Form */}
              <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 48%" } }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
                  Send us a Message
                </Typography>
                <form onSubmit={handleSubmitQuery}>
                  {/* Full Name */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: textColor }}>
                      Full Name <span style={{ color: "#c6ff00" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      variant="outlined"
                      sx={{
                        ...inputStyles,
                        "& .MuiOutlinedInput-root": {
                          ...inputStyles["& .MuiOutlinedInput-root"],
                          bgcolor: darkMode ? "#111" : "#fff",
                        }
                      }}
                    />
                  </Box>
                  {/* Email Address */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: textColor }}>
                      Email Address <span style={{ color: "#c6ff00" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      variant="outlined"
                      sx={{
                        ...inputStyles,
                        "& .MuiOutlinedInput-root": {
                          ...inputStyles["& .MuiOutlinedInput-root"],
                          bgcolor: darkMode ? "#111" : "#fff",
                        }
                      }}
                    />
                  </Box>
                  {/* Phone Number */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: textColor }}>
                      Phone Number <span style={{ color: "#c6ff00" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      name="phone"
                      placeholder="Enter your phone number (+91 1234567890)"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                      variant="outlined"
                      sx={{
                        ...inputStyles,
                        "& .MuiOutlinedInput-root": {
                          ...inputStyles["& .MuiOutlinedInput-root"],
                          bgcolor: darkMode ? "#111" : "#fff",
                        }
                      }}
                    />
                  </Box>
                  {/* Message */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: textColor }}>
                      Message <span style={{ color: "#c6ff00" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      name="message"
                      placeholder="Tell us about your project..."
                      value={formData.message}
                      onChange={handleFormChange}
                      required
                      multiline
                      rows={4}
                      variant="outlined"
                      sx={{
                        ...inputStyles,
                        "& .MuiOutlinedInput-root": {
                          ...inputStyles["& .MuiOutlinedInput-root"],
                          bgcolor: darkMode ? "#111" : "#fff",
                        }
                      }}
                    />
                  </Box>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={submitting}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: "#c6ff00",
                      color: "#000",
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: "1rem",
                      borderRadius: "12px",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#b3e600",
                      },
                    }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Submit Message"}
                  </Button>
                </form>
              </Box>

              {/* Right Side: Contact Info */}
              <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 48%" } }}>
                <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", pl: { xs: 0, md: 4 } }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
                    Get in Touch
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", mb: 6 }}>
                    Have questions about our pricing, AI models, or want to discuss a custom enterprise plan? We'd love to hear from you.
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "rgba(198, 255, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <EmailIcon sx={{ color: "#c6ff00" }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Chat to us</Typography>
                        <Typography variant="body1" fontWeight="bold" component="a" href="mailto:hello@aivx.com" sx={{ textDecoration: "none", color: "inherit", "&:hover": { textDecoration: "underline" } }}>hello@aivx.com</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "rgba(198, 255, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PhoneIcon sx={{ color: "#c6ff00" }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Call us</Typography>
                        <Typography variant="body1" fontWeight="bold" component="a" href="tel:+919876543210" sx={{ textDecoration: "none", color: "inherit", "&:hover": { textDecoration: "underline" } }}>+91 98765 43210</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "rgba(198, 255, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <LanguageIcon sx={{ color: "#c6ff00" }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Visit us</Typography>
                        <Typography variant="body1" fontWeight="bold" component="a" href="https://www.aivx.com" target="_blank" rel="noopener noreferrer" sx={{ textDecoration: "none", color: "inherit", "&:hover": { textDecoration: "underline" } }}>www.aivx.com</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 6 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Follow us</Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <IconButton component="a" href="https://twitter.com" target="_blank" rel="noopener noreferrer" sx={{ bgcolor: darkMode ? "#222" : "#eee", color: textColor, "&:hover": { bgcolor: "#c6ff00", color: "#000" } }}>
                        <TwitterIcon />
                      </IconButton>
                      <IconButton component="a" href="https://linkedin.com" target="_blank" rel="noopener noreferrer" sx={{ bgcolor: darkMode ? "#222" : "#eee", color: textColor, "&:hover": { bgcolor: "#c6ff00", color: "#000" } }}>
                        <LinkedInIcon />
                      </IconButton>
                      <IconButton component="a" href="https://instagram.com" target="_blank" rel="noopener noreferrer" sx={{ bgcolor: darkMode ? "#222" : "#eee", color: textColor, "&:hover": { bgcolor: "#c6ff00", color: "#000" } }}>
                        <InstagramIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FaqPage;
