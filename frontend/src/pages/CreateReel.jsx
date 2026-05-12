import { Box, Typography, Grid, Paper, Button, Stack } from "@mui/material";
// import UserNav from "./UserNav";
import { useThemeContext } from "../context/ThemeContext";

export default function CreateReel() {
  const videos = [1, 2, 3, 4];

  const {
    darkMode,
    toggleTheme,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();

  return (
    <>
      {/* <UserNav /> */}

      <Box
        sx={{
          p: 4,
          minHeight: "100vh",
          bgcolor: bgColor,
          color: textColor,
        }}
      >
        {/* HEADER */}

        <Typography
          variant="h4"
          fontWeight={700}
          mb={1}
          sx={{ color: textColor }}
        >
          Create Reel Video
        </Typography>

        <Typography sx={{ color: secondaryText, mb: 4 }}>
          Select videos, arrange order, and configure transitions
        </Typography>

        <Grid container spacing={3}>
          {/* LEFT SIDE */}

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "24px",
                border: `1px solid ${borderColor}`,
                bgcolor: cardColor,
                boxShadow: "none",
              }}
            >
              <Typography fontWeight={700} mb={2} sx={{ color: textColor }}>
                Available Videos (4)
              </Typography>

              <Stack spacing={2}>
                {videos.map((item) => (
                  <Paper
                    key={item}
                    sx={{
                      p: 2,
                      borderRadius: "18px",
                      border: `1px solid ${borderColor}`,
                      bgcolor: cardColor,
                      boxShadow: "none",
                    }}
                  >
                    {/* VIDEO THUMB */}

                    <Box
                      sx={{
                        height: 140,
                        bgcolor: darkMode ? "#2a2d35" : "#f5f5f5",
                        borderRadius: "14px",
                        mb: 2,
                      }}
                    />

                    <Typography fontWeight={600} sx={{ color: textColor }}>
                      Video thumbnail
                    </Typography>

                    <Typography fontSize={13} sx={{ color: secondaryText }}>
                      cbb83daf...
                    </Typography>

                    <Button
                      fullWidth
                      sx={{
                        mt: 2,
                        bgcolor: "#c6ff00",
                        color: "#000",
                        borderRadius: "14px",
                        fontWeight: 700,
                        textTransform: "none",

                        "&:hover": {
                          bgcolor: "#b7eb00",
                        },
                      }}
                    >
                      Add Video
                    </Button>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* RIGHT SIDE */}

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "24px",
                border: `1px solid ${borderColor}`,
                bgcolor: cardColor,
                boxShadow: "none",
                minHeight: "700px",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                mb={3}
                sx={{ color: textColor }}
              >
                Video Timeline
              </Typography>

              <Box
                sx={{
                  border: `2px dashed ${borderColor}`,
                  borderRadius: "24px",
                  height: "320px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: textColor }}
                >
                  (0 selected)
                </Typography>

                <Typography sx={{ color: secondaryText, mt: 1 }}>
                  Add videos from the left panel to start
                </Typography>
              </Box>

              {/* AUDIO */}

              <Typography
                variant="h6"
                fontWeight={700}
                mt={5}
                mb={2}
                sx={{ color: textColor }}
              >
                Select Audio
              </Typography>

              <Paper
                sx={{
                  p: 3,
                  borderRadius: "18px",
                  border: `1px solid ${borderColor}`,
                  bgcolor: cardColor,
                  boxShadow: "none",
                }}
              >
                <Typography sx={{ color: secondaryText }}>
                  No videos selected
                </Typography>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
