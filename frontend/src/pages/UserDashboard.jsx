import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
  Paper,
  Menu,
  MenuItem,
  Avatar,
  Select,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import ColorLensOutlinedIcon from "@mui/icons-material/ColorLensOutlined";
import HistoryIcon from "@mui/icons-material/History";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AddIcon from "@mui/icons-material/Add";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import CloseIcon from "@mui/icons-material/Close";

import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
// import UserNav from "./UserNav";
import { useThemeContext } from "../context/ThemeContext";
import axios from "axios";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  //   const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    darkMode,
    toggleTheme,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();
  
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const TEMP_URL = "http://localhost:5000";

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
 useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) { navigate("/login"); return; }
    if (role === "ADMIN") { navigate("/admin"); return; }

    // Fetch Videos and Categories jab Video Tab open ho
    if (tab === 1) {
      const fetchTemplateData = async () => {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const [catRes, subCatRes, tempRes] = await Promise.all([
            axios.get(`${API_URL}/template-categories`, { headers }),
            axios.get(`${API_URL}/template-subcategories`, { headers }), 
            axios.get(`${API_URL}/templates`, { headers }) 
          ]);

          setCategories(catRes.data.data || catRes.data); 
          setSubCategories(subCatRes.data.data || subCatRes.data);
          setTemplates(tempRes.data.data || tempRes.data);

          // Pheli category (Jewellery) ko by default select karna
          const cats = catRes.data.data || catRes.data;
          if (cats.length > 0) setSelectedCategoryId(cats[0]._id);
        } catch (error) {
          console.error("Failed to fetch template data:", error);
        }
      };
      fetchTemplateData();
    }
  }, [navigate, tab, API_URL]);

  // --- NAYA CODE START ---
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState({ 1: "", 2: "" }); // Upload dikhane ke liye
  const [uploadedFilePath, setUploadedFilePath] = useState(null);
  const [uploadedImages, setUploadedImages] = useState({ 1: null, 2: null });

  const handleFileUpload = async (event) => {
    if (tab === 0) return;
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imageFile", file);

    let folderName = tab === 1 ? "video_gen" : "theme_gen";

    try {
      setUploadStatus((prev) => ({ ...prev, [tab]: "Uploading... ⏳" }));

      const response = await axios.post(
        `http://localhost:5000/api/upload/image?folder=${folderName}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      setUploadStatus((prev) => ({ ...prev, [tab]: "Upload Successful! 🎉" }));
      setUploadedFilePath(response.data.localPath);

      // Image Preview Set Karna
      setUploadedImages((prev) => ({
        ...prev,
        [tab]: URL.createObjectURL(file),
      }));

      console.log(`Saved at ${folderName}:`, response.data.localPath);
    } catch (error) {
      console.error("Upload Error:", error);
      setUploadStatus((prev) => ({ ...prev, [tab]: "Upload failed! ❌" }));
    } finally {
      event.target.value = null;
    }
  };

  // 👈 NAYA LOGIC: Image remove karne ke liye
  const handleRemoveImage = (e, currentTab) => {
    e.stopPropagation(); // Isse file input dubara trigger nahi hoga
    setUploadedImages((prev) => ({ ...prev, [currentTab]: null }));
    setUploadStatus((prev) => ({ ...prev, [currentTab]: "" }));
  };
  // --- NAYA CODE END ---

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: bgColor,
        color: textColor,
      }}
    >
      {/* <UserNav /> */}
      {/* ================= BODY ================= */}

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        {/* ================= TABS ================= */}
        <Paper
          sx={{
            bgcolor: cardColor,
            border: "1px solid #e0e0e0",
            borderRadius: "14px",
            px: 1,
            py: 0.5,
            mb: 3,
            boxShadow: "none",
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            TabIndicatorProps={{
              style: {
                backgroundColor: "#c6ff00",
                height: 2,
              },
            }}
            sx={{
              minHeight: "42px",
            }}
          >
            <Tab
              icon={<AutoAwesomeIcon />}
              iconPosition="start"
              label="Image Generation"
              sx={{
                color: textColor,
                textTransform: "none",
                fontWeight: 700,
                minHeight: "42px",
                py: 0.5,
              }}
            />

            <Tab
              icon={<VideocamOutlinedIcon />}
              iconPosition="start"
              label="Video Generation"
              sx={{
                color: textColor,
                textTransform: "none",
                minHeight: "42px",
                py: 0.5,
              }}
            />

            <Tab
              icon={<ColorLensOutlinedIcon />}
              iconPosition="start"
              label="Theme Generation"
              sx={{
                color: textColor,
                textTransform: "none",
                minHeight: "42px",
                py: 0.5,
              }}
            />
          </Tabs>
        </Paper>

        {/* ================= MAIN CONTENT ================= */}

        {tab === 0 && (
          <Box
            sx={{
              width: "100%",
              border: "1px solid #e0e0e0",
              borderRadius: "24px",
              overflow: "hidden",
              display: "flex",
              bgcolor: cardColor,
            }}
          >
            {/* LEFT SIDE */}

            <Box
              sx={{
                width: "75%",
                p: 3,
                borderRight: "1px solid #e0e0e0",
                minHeight: "430px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                onClick={() => fileInputRef.current.click()}
                sx={{
                  width: "100%",
                  height: "100%",
                  border: "2px dashed #d6d6d6",
                  borderRadius: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  cursor: "pointer",
                  py: 10,
                }}
              >
                {/* ICON */}

                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "#c6ff00",
                    borderRadius: "22px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mb: 3,
                    boxShadow: "0 0 25px rgba(198,255,0,0.3)",
                  }}
                >
                  <CloudUploadRoundedIcon
                    sx={{
                      color: textColor,
                      fontSize: 40,
                    }}
                  />
                </Box>

                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {uploadStatus[0] ? uploadStatus[0] : "Tap to upload"}
                </Typography>

                <Typography
                  sx={{
                    color: secondaryText,
                    mb: 2,
                  }}
                >
                  or drag & drop your image here
                </Typography>

                <Typography
                  sx={{
                    color: secondaryText,
                  }}
                >
                  PNG · JPG · WebP · Max 10MB
                </Typography>
              </Box>
            </Box>

            {/* RIGHT SIDE */}

            <Box
              sx={{
                width: "25%",
                minHeight: "430px",
                bgcolor: cardColor,
              }}
            >
              {[1, 2, 3].map((item) => (
                <Box
                  key={item}
                  sx={{
                    height: "143px",
                    borderBottom: item !== 3 ? "1px solid #e0e0e0" : "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: secondaryText,
                    fontSize: "22px",
                    fontWeight: 600,
                  }}
                >
                  Shot {item}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ================= VIDEO GENERATION ================= */}

        {tab === 1 && (
          <Paper
            sx={{
              bgcolor: cardColor,
              border: "1px solid #e0e0e0",
              borderRadius: "28px",
              overflow: "hidden",
              minHeight: "700px",
              boxShadow: "none",
            }}
          >
            <Grid container>
              {/* LEFT PANEL */}

              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    p: 2,
                    borderRight: "1px solid #e0e0e0",
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      color: textColor,
                      mb: 1,
                    }}
                  >
                    Image to Video
                  </Typography>

                  {/* 👈 TAB 1 UPLOAD BOX UPDATE */}
                  <Box
                    onClick={() =>
                      !uploadedImages[1] && fileInputRef.current.click()
                    }
                    sx={{
                      position: "relative",
                      border: uploadedImages[1] ? "none" : "2px dashed #d6d6d6",
                      borderRadius: "20px",
                      height: "180px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      color: textColor,
                      cursor: uploadedImages[1] ? "default" : "pointer",
                      "&:hover": {
                        borderColor: uploadedImages[1] ? "none" : "#c6ff00",
                      },
                      mb: 3,
                      overflow: "hidden",
                    }}
                  >
                    {uploadedImages[1] ? (
                      <>
                        <img
                          src={uploadedImages[1]}
                          alt="Video Ref"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <Box
                          onClick={(e) => handleRemoveImage(e, 1)}
                          sx={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            bgcolor: "black",
                            color: "white",
                            borderRadius: "50%",
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            zIndex: 10,
                            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 18 }} />
                        </Box>
                      </>
                    ) : (
                      <>
                        <CloudUploadRoundedIcon sx={{ fontSize: 50, mb: 2 }} />
                        <Typography fontWeight={700}>
                          {uploadStatus[1]
                            ? uploadStatus[1]
                            : "DROP OR CLICK TO UPLOAD"}
                        </Typography>
                        {!uploadStatus[1] && (
                          <Typography variant="body2">
                            JPG, PNG, WEBP, HEIC — max 10MB
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>

                  {/* PROMPT */}

                  <Paper
                    sx={{
                      bgcolor: cardColor,
                      border: "1px solid #e0e0e0",
                      borderRadius: "16px",
                      overflow: "hidden",
                      mb: 3,
                      boxShadow: "none",
                    }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: "1px solid #e0e0e0",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        sx={{
                          color: textColor,
                          fontWeight: 700,
                        }}
                      >
                        VIDEO PROMPT
                      </Typography>

                      <Typography
                        sx={{
                          color: "#7cb518",
                          fontWeight: 700,
                        }}
                      >
                        62 credits
                      </Typography>
                    </Box>
                    <textarea
                      placeholder="Describe the video you want to generate..."
                      style={{
                        width: "100%",
                        height: "220px",
                        background: cardColor,
                        border: "none",
                        outline: "none",
                        color: textColor,
                        padding: "20px",
                        resize: "none",
                        fontSize: "16px",
                        borderBottom: "1px solid #e0e0e0",
                        boxSizing: "border-box",
                      }}
                    />
                  </Paper>
                  {/* OPTIONS */}

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "flex-start",
                      flexWrap: "nowrap",
                      mb: 2,
                    }}
                  >
                    {/* DURATION */}

                    <Box sx={{ width: "180px" }}>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: textColor,
                          mb: 1,
                          fontWeight: 700,
                        }}
                      >
                        Duration
                      </Typography>

                      <Paper
                        sx={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "14px",
                          px: 2,
                          py: 1,
                          boxShadow: "none",
                        }}
                      >
                        <Typography fontWeight={600} fontSize={12}>
                          5s
                        </Typography>
                      </Paper>
                    </Box>

                    {/* VIDEO MODEL */}

                    <Box sx={{ width: "160px" }}>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: textColor,
                          mb: 1,
                          fontWeight: 700,
                        }}
                      >
                        Video Model
                      </Typography>

                      <Paper
                        sx={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "14px",
                          px: 2,
                          py: 1,
                          boxShadow: "none",
                        }}
                      >
                        <Typography fontWeight={600} fontSize={12}>
                          Turbo Standard
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>

                  {/* BUTTON */}

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: "#c68b45",
                      color: cardColor,
                      borderRadius: "16px",
                      py: 2,
                      fontWeight: 700,
                      fontSize: "18px",
                      "&:hover": {
                        bgcolor: "#b57a35",
                      },
                    }}
                  >
                    GENERATE 5S VIDEO • 62
                  </Button>
                </Box>
              </Grid>

              {/* RIGHT PANEL */}
{/* 🚀 DYNAMIC RIGHT PANEL (VIDEO TEMPLATES) 🚀 */}
              <Grid item xs={12} md={7}>
                <Box sx={{ p: 3 }}>
                  <Typography sx={{ color: textColor, fontWeight: 700, mb: 3, letterSpacing: 1 }}>VIDEO TEMPLATES</Typography>

                  {/* 1. DYNAMIC MAIN CATEGORIES */}
                  <Stack direction="row" spacing={2} mb={2} sx={{ overflowX: "auto" }}>
                    {categories.map((cat) => (
                      <Button
                        key={cat._id}
                        variant="outlined"
                        onClick={() => { setSelectedCategoryId(cat._id); setSelectedSubCategoryId(""); }}
                        sx={{
                          borderColor: selectedCategoryId === cat._id ? "#c6ff00" : borderColor,
                          color: selectedCategoryId === cat._id ? "#7cb518" : textColor,
                          borderRadius: "14px", minWidth: "max-content",
                        }}
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </Stack>

                  {/* 2. DYNAMIC SUB CATEGORIES (Appears below Main Category) */}
                  {selectedCategoryId && (
                    <Stack direction="row" spacing={1.5} mb={3} sx={{ overflowX: "auto" }}>
                      <Button
                         variant="outlined" size="small"
                         onClick={() => setSelectedSubCategoryId("")}
                         sx={{
                           borderColor: selectedSubCategoryId === "" ? "#c6ff00" : borderColor,
                           color: selectedSubCategoryId === "" ? "#7cb518" : secondaryText,
                           borderRadius: "12px", textTransform: "none",
                         }}
                      >All</Button>
                      
                      {subCategories.filter((sub) => sub.categoryId === selectedCategoryId).map((sub) => (
                        <Button
                          key={sub._id}
                          variant="outlined" size="small"
                          onClick={() => setSelectedSubCategoryId(sub._id)}
                          sx={{
                            borderColor: selectedSubCategoryId === sub._id ? "#c6ff00" : borderColor,
                            color: selectedSubCategoryId === sub._id ? "#7cb518" : secondaryText,
                            borderRadius: "12px", textTransform: "none",
                          }}
                        >
                          {sub.name}
                        </Button>
                      ))}
                    </Stack>
                  )}

                  {/* 3. TEMPLATE CARDS WITH VIDEOS */}
                  <Grid container spacing={2}>
                    {templates
                      .filter((t) => t.categoryId === selectedCategoryId)
                      .filter((t) => !selectedSubCategoryId || t.subcategoryId === selectedSubCategoryId)
                      .map((template) => (
                        <Grid item xs={12} sm={6} md={4} key={template._id}>
                          <Paper sx={{ bgcolor: cardColor, borderRadius: "18px", overflow: "hidden", border: "1px solid #e0e0e0", boxShadow: "none", cursor: "pointer", transition: "0.2s", "&:hover": { borderColor: "#c6ff00", transform: "translateY(-4px)" } }}>
                            
                            {/* 🔥 THE VIDEO PLAYER 🔥 */}
                            <Box sx={{ height: 180, bgcolor: "#000", position: "relative" }}>
                              <video
                                src={`${TEMP_URL}${template.imageUrl}`}
                                autoPlay loop muted playsInline
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </Box>

                            <Box p={2}>
                              <Typography sx={{ color: "#c68b45", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {template.name || template.fileName}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                    ))}

                    {/* EMPTY STATE */}
                    {templates.filter(t => t.categoryId === selectedCategoryId && (!selectedSubCategoryId || t.subcategoryId === selectedSubCategoryId)).length === 0 && (
                      <Typography sx={{ color: secondaryText, mt: 2, ml: 2, width: "100%", textAlign: "center" }}>
                        No videos found. Upload videos to the backend and seed the database.
                      </Typography>
                    )}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* ================= THEME GENERATION ================= */}

        {tab === 2 && (
          <>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                color: textColor,
                // mb: 1,
              }}
            >
              Theme Generator
            </Typography>

            <Typography
              sx={{
                color: secondaryText,
                mb: 2,
              }}
            >
              Generate a new theme from a reference image using AI.
            </Typography>

            <Paper
              sx={{
                bgcolor: cardColor,
                border: "1px solid #e0e0e0",
                borderRadius: "28px",
                p: 4,
                minHeight: "10px",
                boxShadow: "none",
              }}
            >
              <Grid container spacing={7}>
                {/* LEFT */}

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    {/* FIRST SELECT */}

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{ color: textColor, mb: 1, fontWeight: 700 }}
                      >
                        MAIN CATEGORY
                      </Typography>
                      <Select
                        defaultValue=""
                        displayEmpty
                        sx={{
                          width: "100%",
                          height: "45px",
                          bgcolor: cardColor,
                          borderRadius: "14px",
                          color: textColor,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#d6d6d6",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#c6ff00", // Hover par theme color
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#c6ff00",
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          Main Category
                        </MenuItem>
                        <MenuItem value="jewellery">
                          Jewellery
                        </MenuItem>
                      </Select>
                    </Box>

                    {/* SUB CATEGORY */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{ color: textColor, mb: 1, fontWeight: 700 }}
                      >
                        SUB CATEGORY
                      </Typography>
                      <Select
                        defaultValue=""
                        displayEmpty
                        sx={{
                          width: "100%",
                          height: "45px",
                          bgcolor: cardColor,
                          borderRadius: "14px",
                          color: textColor,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#d6d6d6",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#c6ff00",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#c6ff00",
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          Sub Category
                        </MenuItem>
                        <MenuItem value="rings">Rings</MenuItem>
                        <MenuItem value="necklaces">Pendant</MenuItem>
                        <MenuItem value="earrings">Bangles</MenuItem>
                        <MenuItem value="clothing">Articles</MenuItem>
                      </Select>
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      color: textColor,
                      mb: 2,
                      fontWeight: 700,
                      fontSize: "25px",
                    }}
                  >
                    Custom Instructions (Optional)
                  </Typography>

                  <textarea
                    placeholder="Enter specific details you'd like the AI to include in the theme..."
                    style={{
                      width: "100%",
                      height: "260px",
                      background: cardColor,
                      border: "1px solid #d6d6d6",
                      borderRadius: "20px",
                      color: textColor,
                      padding: "20px",
                      fontSize: "18px",
                      resize: "none",
                    }}
                  />
                </Grid>

                {/* RIGHT */}

                <Grid item xs={12} md={6}>
                  <Typography
                    sx={{
                      color: textColor,
                      fontWeight: 700,
                      mb: 2,
                    }}
                  >
                    Reference Image *
                  </Typography>

                  {/* 👈 TAB 2 UPLOAD BOX UPDATE */}
                  <Box
                    onClick={() =>
                      !uploadedImages[2] && fileInputRef.current.click()
                    }
                    sx={{
                      position: "relative",
                      border: uploadedImages[2] ? "none" : "2px dashed #d6d6d6",
                      cursor: uploadedImages[2] ? "default" : "pointer",
                      borderRadius: "30px",
                      height: "360px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      color: secondaryText,
                      width: "100%",
                      overflow: "hidden",
                    }}
                  >
                    {uploadedImages[2] ? (
                      <>
                        <img
                          src={uploadedImages[2]}
                          alt="Theme Ref"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <Box
                          onClick={(e) => handleRemoveImage(e, 2)}
                          sx={{
                            position: "absolute",
                            top: 15,
                            right: 15,
                            bgcolor: "black",
                            color: "white",
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            zIndex: 10,
                            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 20 }} />
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            bgcolor: "rgba(198,255,0,0.15)",
                            borderRadius: "30px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            mb: 4,
                          }}
                        >
                          <CloudUploadRoundedIcon
                            sx={{ fontSize: 50, color: "#7cb518" }}
                          />
                        </Box>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          sx={{ color: textColor, mb: 2 }}
                        >
                          {uploadStatus[2]
                            ? uploadStatus[2]
                            : "Drop your reference here"}
                        </Typography>
                        <Typography
                          sx={{ color: textColor, textAlign: "center" }}
                        >
                          Supports JPG, PNG, WEBP & HEIC
                          <br />
                          (Max size 16MB)
                        </Typography>
                      </>
                    )}
                  </Box>

                  <Button
                    // fullWidth
                    variant="contained"
                    sx={{
                      mt: 4,
                      bgcolor: borderColor,
                      color: textColor,
                      borderRadius: "18px",
                      //   py: 2,
                      fontWeight: 700,
                      fontSize: "22px",
                      "&:hover": {
                        bgcolor: "#c6c6c6",
                      },
                    }}
                  >
                    Generate Theme • 299
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}

        {/* ================= BUTTON ================= */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 5,
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: "#c6ff00",
              color: textColor,
              borderRadius: "50px",
              px: 5,
              py: 1.5,
              fontWeight: 700,
              fontSize: "16px",
              textTransform: "none",

              "&:hover": {
                bgcolor: "#b7eb00",
              },
            }}
          >
            Generate
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
