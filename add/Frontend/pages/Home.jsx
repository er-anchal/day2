import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Categories from "../components/Categories";
import Footer from "../components/Footer";

import { useEffect, useState } from "react";
import axios from "axios";

import TemplateIcon from "@mui/icons-material/Dashboard";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import { Person, PlayCircle, StayCurrentPortrait } from "@mui/icons-material";

import CampaignIcon from "@mui/icons-material/Campaign";
import PetsIcon from "@mui/icons-material/Pets";
import FestivalIcon from "@mui/icons-material/Festival";
import SchoolIcon from "@mui/icons-material/School";
import CakeIcon from "@mui/icons-material/Cake";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PhotoIcon from "@mui/icons-material/Photo";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import TempleHinduIcon from "@mui/icons-material/TempleHindu";
import NatureIcon from "@mui/icons-material/Nature";
import HealingIcon from "@mui/icons-material/Healing";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import CelebrationIcon from "@mui/icons-material/Celebration";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import { useThemeContext } from "../context/ThemeContext";

import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const bannerImages = ["/image/banner.jpeg", "/image/banner1.jpeg"];

const Home = () => {
  const { token, user } = useAuth();
  const isLoggedIn = !!token;
  const navigate = useNavigate();

  const [landingData, setLandingData] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [banners, setBanners] = useState(bannerImages);
  const [selectedSubcategories, setSelectedSubcategories] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;
  const TEMP_URL = import.meta.env.VITE_TEMP_URL;

  const theme = useTheme();
  const {
    darkMode,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();
  // CATEGORY ICONS (kept for future use)
  const categoryIcons = {
    "headers-and-footers": <TemplateIcon sx={{ fontSize: 35 }} />,
    "good-morning": <WbSunnyIcon sx={{ fontSize: 35 }} />,
    "good-night": <BedtimeIcon sx={{ fontSize: 35 }} />,
    "get-well-soon": <HealingIcon sx={{ fontSize: 35 }} />,
    "death-anniversary": (
      <SentimentVeryDissatisfiedIcon sx={{ fontSize: 35 }} />
    ),
    "global-cycle-day": <DirectionsBikeIcon sx={{ fontSize: 35 }} />,
    "nag-panchami": <PetsIcon sx={{ fontSize: 35 }} />,
    congrats: <CelebrationIcon sx={{ fontSize: 35 }} />,
    political: <HowToVoteIcon sx={{ fontSize: 35 }} />,
    "wedding-anniversary": <FavoriteIcon sx={{ fontSize: 35 }} />,
    "birth-anniversary": <CakeIcon sx={{ fontSize: 35 }} />,
    "global-milk-day": <LocalDrinkIcon sx={{ fontSize: 35 }} />,
    "international-day-of-innocent-children-victim-of-aggression": (
      <CampaignIcon sx={{ fontSize: 35 }} />
    ),
    motivational: <WorkspacePremiumIcon sx={{ fontSize: 35 }} />,
    "akshaya-tritiya": <FestivalIcon sx={{ fontSize: 35 }} />,
    gods: <TempleHinduIcon sx={{ fontSize: 35 }} />,
    nature: <NatureIcon sx={{ fontSize: 35 }} />,
    festival: <FestivalIcon sx={{ fontSize: 35 }} />,
    education: <SchoolIcon sx={{ fontSize: 35 }} />,
    birthday: <CakeIcon sx={{ fontSize: 35 }} />,
    poster: <CampaignIcon sx={{ fontSize: 35 }} />,
    certificate: <WorkspacePremiumIcon sx={{ fontSize: 35 }} />,
    default: <PhotoIcon sx={{ fontSize: 35 }} />,
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/template-categories/landing`)
      .then((res) => {
        setLandingData(res.data);

        if (res.data.length > 0) {
          setActiveCategory(res.data[0]);
        }
      })
      .catch((err) => console.error("Landing data error:", err));
  }, [API_URL]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBanners((prev) => {
        const newArr = [...prev];
        const first = newArr.shift();
        newArr.push(first);
        return newArr;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (value) => {
    setSearchText(value);

    // Clear results if search box is empty
    if (!value.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/search?q=${encodeURIComponent(value)}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        },
      );

      console.log("Search API Response:", res.data);

      // Normalize response:
      // If backend returns only `categories`, use them as `subcategories`
      const formattedResults = {
        subcategories: res.data.subcategories || res.data.categories || [],

        templates: res.data.templates || [],
      };

      console.log("Formatted Search Results:", formattedResults);

      setSearchResults(formattedResults);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults({
        subcategories: [],
        templates: [],
      });
    }
  };
  const templateSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        transition: "0.3s ease",
      }}
    >
      {!isLoggedIn ? (
        <>
          {/* HERO SECTION */}
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                position: "relative",
                display: "flex",
                height: 500,
                overflow: "hidden",
                borderRadius: 0,
                "&:hover .overlay": {
                  opacity: 1,
                },
              }}
            >
              {banners.map((img, index) => (
                <Box
                  key={index}
                  sx={{
                    minWidth: "50%",
                    height: "100%",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}

              <Box
                className="overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: cardColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  textAlign: "center",
                  opacity: 0,
                  transition: "0.3s ease",
                  zIndex: 10,
                  color: textColor,
                  px: 3,
                }}
              >
                <Typography variant="h3" fontWeight={700}>
                  Welcome to Image Editor
                </Typography>

                <Typography variant="h6" sx={{ mt: 1, opacity: 0.9 }}>
                  Create banners, posters & reusable templates for free
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mt: 3,
                    justifyContent: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => navigate("/register")}
                    sx={{
                      px: 4,
                      py: 1.3,
                      borderRadius: 3,
                      fontWeight: 600,
                    }}
                  >
                    Get Started
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => navigate("/pricing")}
                    sx={{
                      px: 4,
                      py: 1.3,
                      borderRadius: 3,
                      backgroundColor: bgColor,
                      fontWeight: 600,
                    }}
                  >
                    Pricing
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* FEATURES */}
          <Box
            sx={{
              px: { xs: 4, sm: 4, md: 6 },
              py: { xs: 4, sm: 5, md: 6 },
              m: 2,
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              textAlign="center"
              sx={{ mb: 6 }}
            >
              DESIGN YOUR FRAMES WITH IMAGE EDITOR
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "center",
                gap: 4,
                px: 2,
                py: 3,
              }}
            >
              {[
                {
                  icon: (
                    <PlayCircle
                      sx={{ fontSize: 52, color: "primary.main", mb: 2 }}
                    />
                  ),
                  title: "Create Designs",
                  desc: "Create attractive unlimited designs for festivals, business promotions, birthdays, anniversaries, political campaigns, and social media posts.",
                },
                {
                  icon: (
                    <StayCurrentPortrait
                      sx={{ fontSize: 52, color: "primary.main", mb: 2 }}
                    />
                  ),
                  title: "Easy to Use",
                  desc: "The Image Editor app provides a simple and user-friendly interface that helps anyone create professional designs quickly and easily.",
                },
                {
                  icon: (
                    <Person
                      sx={{ fontSize: 52, color: "primary.main", mb: 2 }}
                    />
                  ),
                  title: "Best User Experience",
                  desc: "Access unlimited festival posters, motivational quotes, tribute posts, anniversary templates, and customizable creative designs with ease.",
                },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    p: 4,
                    borderRadius: 3,
                    textAlign: "center",
                    border: "1px solid #ddd",
                    backgroundColor: cardColor,
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  {item.icon}
                  <Typography fontWeight={600} variant="h6" sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    lineHeight={1.7}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              px: { xs: 2, sm: 4, md: 6 },
              py: 4,
            }}
          >
            {landingData?.map((categoryBlock, categoryIndex) => {
              const category = categoryBlock.category;
              const templates = categoryBlock.templates || [];

              if (!templates.length) return null;

              // Group templates by subcategory
              const groupedSubcategories = {};

              templates.forEach((template) => {
                const subcategoryName =
                  template.subCategory?.name ||
                  template.subcategory?.name ||
                  template.subCategoryName ||
                  template.subcategoryName ||
                  "Other";

                if (!groupedSubcategories[subcategoryName]) {
                  groupedSubcategories[subcategoryName] = [];
                }

                groupedSubcategories[subcategoryName].push(template);
              });

              const subcategories = Object.entries(groupedSubcategories);

              // Track selected subcategory for this category
              const selectedSubcategory =
                selectedSubcategories[categoryBlock._id] ||
                subcategories[0]?.[0];

              return (
                <Box key={categoryBlock._id || categoryIndex} sx={{ mb: 8 }}>
                  {/* CATEGORY TITLE */}
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    mb={3}
                    sx={{
                      backgroundColor: darkMode ? "#1e2a3a" : "#1976d2",
                      color: "#fff",
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      display: "inline-block",
                    }}
                  >
                    {category?.name}
                  </Typography>

                  {/* SUBCATEGORY SLIDER */}
                  <Box
                    sx={{
                      mb: 4,
                      "& .slick-prev:before, & .slick-next:before": {
                        color: "#1976d2",
                        fontSize: "25px",
                      },
                      "& .slick-prev": {
                        left: "-35px",
                        zIndex: 10,
                      },
                      "& .slick-next": {
                        right: "-15px",
                        zIndex: 10,
                      },
                    }}
                  >
                    <Slider {...templateSettings}>
                      {subcategories.map(([subcategoryName, subTemplates]) => {
                        const firstTemplate = subTemplates[0];

                        const templateSubcategory =
                          firstTemplate.subCategory?.name ||
                          firstTemplate.subcategory?.name ||
                          firstTemplate.subCategoryName ||
                          firstTemplate.subcategoryName ||
                          subcategoryName;

                        const categoryFolder = encodeURIComponent(
                          firstTemplate.categorySlug || category?.slug || "",
                        );

                        const subcategoryFolder =
                          encodeURIComponent(templateSubcategory);

                        const fileName = encodeURIComponent(
                          firstTemplate.fileName,
                        );

                        const imageUrl = `${TEMP_URL}/uploads/${categoryFolder}/${subcategoryFolder}/${fileName}`;

                        const isActive =
                          selectedSubcategory === subcategoryName;

                        return (
                          <Box key={subcategoryName} sx={{ px: 1 }}>
                            <Box
                              onClick={() =>
                                setSelectedSubcategories((prev) => ({
                                  ...prev,
                                  [categoryBlock._id]: subcategoryName,
                                }))
                              }
                              sx={{
                                cursor: "pointer",
                                borderRadius: 3,
                                overflow: "hidden",
                                border: isActive
                                  ? "3px solid #1976d2"
                                  : "1px solid #e0e0e0",
                                backgroundColor: cardColor,
                                transition: "0.3s",
                                "&:hover": {
                                  transform: "translateY(-5px)",
                                  boxShadow: 6,
                                },
                              }}
                            >
                              {/* <Box
                                component="img"
                                // src={imageUrl}
                                alt={subcategoryName}
                                onError={(e) => {
                                  e.target.src = "/image/no-image.png";
                                }}
                                sx={{
                                  width: "100%",
                                  height: 180,
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              /> */}

                              <Box sx={{ p: 1.5 }}>
                                <Typography
                                  variant="body1"
                                  fontWeight={600}
                                  textAlign="center"
                                  noWrap
                                >
                                  {subcategoryName}
                                </Typography>

                                {/* <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  textAlign="center"
                                >
                                  {subTemplates.length} Templates
                                </Typography> */}
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Slider>
                  </Box>

                  {/* SELECTED SUBCATEGORY TITLE */}
                  {selectedSubcategory && (
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      mb={2}
                      sx={{
                        color: "#1976d2",
                        borderLeft: "4px solid #1976d2",
                        pl: 2,
                      }}
                    >
                      {selectedSubcategory}
                    </Typography>
                  )}

                  {/* TEMPLATE SLIDER FOR SELECTED SUBCATEGORY */}
                  {selectedSubcategory &&
                    groupedSubcategories[selectedSubcategory] && (
                      <Box
                        sx={{
                          "& .slick-prev:before, & .slick-next:before": {
                            color: "#1976d2",
                            fontSize: "25px",
                          },
                          "& .slick-prev": {
                            left: "-35px",
                            zIndex: 10,
                          },
                          "& .slick-next": {
                            right: "-15px",
                            zIndex: 10,
                          },
                        }}
                      >
                        <Slider {...templateSettings}>
                          {groupedSubcategories[selectedSubcategory].map(
                            (template) => {
                              const templateSubcategory =
                                template.subCategory?.name ||
                                template.subcategory?.name ||
                                template.subCategoryName ||
                                template.subcategoryName ||
                                selectedSubcategory;

                              const categoryFolder = encodeURIComponent(
                                template.categorySlug || category?.slug || "",
                              );

                              const subcategoryFolder =
                                encodeURIComponent(templateSubcategory);

                              const fileName = encodeURIComponent(
                                template.fileName,
                              );

                              const imageUrl = `${TEMP_URL}/uploads/${categoryFolder}/${subcategoryFolder}/${fileName}`;

                              return (
                                <Box key={template._id} sx={{ px: 1 }}>
                                  <Box
                                    onClick={() => {
                                      if (!isLoggedIn) {
                                        navigate("/register");
                                      } else {
                                        navigate(
                                          `/design/new?bg=${encodeURIComponent(
                                            imageUrl,
                                          )}&templateId=${template._id}`,
                                        );
                                      }
                                    }}
                                    sx={{
                                      height: 220,
                                      borderRadius: 2,
                                      overflow: "hidden",
                                      cursor: "pointer",
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
                                      alt={template.name || template.fileName}
                                      onError={(e) => {
                                        e.target.src = "/image/no-image.png";
                                      }}
                                      sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                      }}
                                    />
                                  </Box>

                                  <Typography
                                    variant="body2"
                                    fontWeight={500}
                                    mt={1}
                                    textAlign="center"
                                    noWrap
                                  >
                                    {template.name || template.fileName}
                                  </Typography>
                                </Box>
                              );
                            },
                          )}
                        </Slider>
                      </Box>
                    )}
                </Box>
              );
            })}
          </Box>
          <Footer />
        </>
      ) : (
        <Box
          sx={{
            px: { xs: 4, sm: 4, md: 6 },
            py: { xs: 4, sm: 3, md: 4 },
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              mb: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Image Editor
              </Typography>
              <Typography color={textColor}>
                Create banners, posters & reusable templates
              </Typography>
            </Box>

            {/* SEARCH */}
            <Box sx={{ position: "relative", width: 500 }}>
              <TextField
                placeholder="Search templates..."
                size="small"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(`/templates?search=${searchText}`);
                  }
                }}
                sx={{
                  width: "100%",
                  backgroundColor: "#fff",
                  borderRadius: 1,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* SEARCH RESULTS DROPDOWN */}
              {/* SEARCH RESULTS DROPDOWN */}
              {searchResults &&
                ((searchResults.subcategories?.length || 0) > 0 ||
                  (searchResults.templates?.length || 0) > 0) && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      backgroundColor: cardColor,
                      boxShadow: 3,
                      borderRadius: 2,
                      mt: 1,
                      p: 1,
                      zIndex: 1000,
                      maxHeight: 350,
                      overflowY: "auto",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    {/* SHOW ONLY SUBCATEGORY NAMES */}
                    {searchResults.templates?.map((template, index) => {
                      const subcategoryName =
                        template.subcategoryName ||
                        template.subCategory?.name ||
                        "Other";

                      const subcategorySlug =
                        template.subcategorySlug ||
                        template.subCategory?.slug ||
                        subcategoryName.toLowerCase().replace(/\s+/g, "-");

                      // Show each subcategory only once
                      const alreadyShown = searchResults.templates
                        .slice(0, index)
                        .some((t) => {
                          const prevName =
                            t.subcategoryName || t.subCategory?.name || "Other";
                          return prevName === subcategoryName;
                        });

                      if (alreadyShown) return null;

                      return (
                        <Box
                          key={subcategorySlug}
                          onClick={() => {
                            setSearchText(subcategoryName);
                            setSearchResults(null);

                            // Open templates page filtered by subcategory
                            navigate(
                              `/templates?subcategory=${encodeURIComponent(
                                subcategorySlug,
                              )}`,
                            );
                          }}
                          sx={{
                            px: 2,
                            py: 1.5,
                            cursor: "pointer",
                            borderRadius: 1,
                            transition: "0.2s",
                            "&:hover": {
                              backgroundColor: darkMode ? "#1e293b" : "#f5f5f5",
                            },
                          }}
                        >
                          <Typography fontWeight={600}>
                            📂 {subcategoryName}
                          </Typography>
                          {/* 
                          <Typography variant="caption" color={secondaryText}>
                            View templates
                          </Typography> */}
                        </Box>
                      );
                    })}
                  </Box>
                )}
            </Box>

            {/* ADMIN BUTTON */}
            {user?.role === "ADMIN" && (
              <Card
                sx={{
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  bgcolor: bgColor,
                  color: textColor,
                  px: 2,
                  cursor: "pointer",
                  transition: "0.2s",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                  // color={textColor}
                >
                  <TemplateIcon />

                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography fontWeight={600} sx={{ whiteSpace: "nowrap" }}>
                      Create Template
                    </Typography>
                    <Typography variant="body2">
                      Design reusable layouts
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    onClick={() => navigate("/templates/add")}
                    sx={{
                      minWidth: "auto",
                      px: 1,
                      bgcolor: darkMode ? "#1e293b" : "#1976d2",
                      color: "#fff",
                      border: `0.1px solid ${textColor}`, // ✅ correct
                    }}
                  >
                    <AddIcon />
                  </Button>
                </Box>
              </Card>
            )}
          </Box>

          {/* TEMPLATE LIBRARY */}
          <Categories selectedCategory={selectedCategory} />
        </Box>
      )}
    </Box>
  );
};

export default Home;
