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

    // NOT LOGGED IN
    if (!token) {
      navigate("/login");
      return;
    }

    // ADMIN
    if (role === "ADMIN") {
      navigate("/admin");
      return;
    }
  }, [navigate]);
  const handleCreateReel = () => {
    navigate("/create-reel");
  };

  const handleHistory = () => {
    navigate("/history");
  };

  const handleCatalogue = () => {
    navigate("/catalogue");
  };

  // --- NAYA CODE START ---
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState(""); // Upload dikhane ke liye
  const [uploadedFilePath, setUploadedFilePath] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imageFile', file); // 'imageFile' backend ke multer se match hona chahiye

    try {
      setUploadStatus("Uploading... Please wait ⏳");
      
      // Backend ko request bhej rahe hain
      const response = await axios.post('http://localhost:5000/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadStatus("Upload Successful! 🎉");
      setUploadedFilePath(response.data.localPath); // Video generation me kaam aayega
      console.log("Server par file yahan save hui:", response.data.localPath);

    } catch (error) {
      console.error('Upload Error:', error);
      setUploadStatus("Upload failed! ❌");
    }
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
                sx={{
                  width: "100%",
                  height: "100%",
                  border: "2px dashed #d6d6d6",
                  borderRadius: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
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
                  Tap to upload
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

                  {/* UPLOAD */}
                    <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Box
                    onClick={() => fileInputRef.current.click()}
                    sx={{
                      border: "2px dashed #d6d6d6",
                      borderRadius: "20px",
                      height: "180px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      color: textColor,
                      cursor: "pointer",
                      "&:hover": { borderColor: "#c6ff00" },
                      mb: 3,
                    }}
                  >
                    <CloudUploadRoundedIcon sx={{ fontSize: 50, mb: 2 }} />

                    <Typography fontWeight={700}>
                      {uploadStatus ? uploadStatus : "DROP OR CLICK TO UPLOAD"}
                    </Typography>

                    {!uploadStatus && (
                      <Typography variant="body2">
                        JPG, PNG, WEBP, HEIC — max 10MB
                      </Typography>
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

              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    p: 3,
                  }}
                >
                  <Typography
                    sx={{
                      color: textColor,
                      fontWeight: 700,
                      mb: 3,
                      letterSpacing: 1,
                    }}
                  >
                    VIDEO TEMPLATES
                  </Typography>

                  {/* CATEGORY */}

                  <Stack direction="row" spacing={2} mb={3}>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: "#c6ff00",
                        color: "#7cb518",
                        borderRadius: "14px",
                      }}
                    >
                      Jewellery
                    </Button>

                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: borderColor,
                        color: textColor,
                        borderRadius: "14px",
                      }}
                    >
                      Fashion
                    </Button>
                  </Stack>

                  {/* TEMPLATE CARDS */}

                  <Grid container spacing={2}>
                    {[1, 2, 3, 4].map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item}>
                        <Paper
                          sx={{
                            bgcolor: cardColor,
                            borderRadius: "18px",
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                            boxShadow: "none",
                          }}
                        >
                          <Box
                            sx={{
                              height: 180,
                              bgcolor: "#f5f5f5",
                            }}
                          />

                          <Box p={2}>
                            <Typography
                              sx={{
                                color: "#c68b45",
                                fontWeight: 700,
                                fontSize: "14px",
                              }}
                            >
                              TEMPLATE {item}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
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
                        sx={{
                          color: textColor,
                          mb: 1,
                          fontWeight: 700,
                        }}
                      >
                        MAIN CATEGORY
                      </Typography>

                      <select
                        style={{
                          width: "100%",
                          height: "35px",
                          background: cardColor,
                          border: "1px solid #d6d6d6",
                          borderRadius: "14px",
                          color: textColor,
                          padding: "0 16px",
                        }}
                      >
                        <option>Jewellery</option>
                      </select>
                    </Box>

                    {/* SECOND SELECT */}

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: textColor,
                          mb: 1,
                          fontWeight: 700,
                        }}
                      >
                        MAIN CATEGORY
                      </Typography>

                      <select
                        style={{
                          width: "100%",
                          height: "35px",
                          background: cardColor,
                          border: "1px solid #d6d6d6",
                          borderRadius: "14px",
                          color: textColor,
                          padding: "0 16px",
                        }}
                      >
                        <option>Jewellery</option>
                      </select>
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

                  <Box
                    sx={{
                      border: "2px dashed #d6d6d6",
                      borderRadius: "30px",
                      height: "360px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      color: secondaryText,
                      width: "160%",
                    }}
                  >
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
                        sx={{
                          fontSize: 50,
                          color: "#7cb518",
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{
                        color: textColor,
                        mb: 2,
                      }}
                    >
                      Drop your reference here
                    </Typography>

                    <Typography
                      sx={{
                        color: textColor,
                        textAlign: "center",
                      }}
                    >
                      Supports JPG, PNG, WEBP & HEIC
                      <br />
                      (Max size 16MB)
                    </Typography>
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
