import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import axios from "axios";

export default function Pricing() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/subscription-plans");
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Box sx={{ px: { xs: 2, md: 8 }, py: 6 }}>
        {/* HEADER */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h6"
            sx={{
              border: "1px solid black",
              borderRadius: "8px",
              display: "inline-block",
              px: 2,
              py: 0.5,
            }}
          >
            Flexible Plans for Everyone
          </Typography>

          <Typography variant="h2" fontWeight={900}>
            Pricing Plans
          </Typography>

          <Typography color="text.secondary" mt={1}>
            Create studio-quality AI images & videos - at a fraction of
            traditional photoshoot cost
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/contact-us")}
            sx={{
              mt: 3,
              px: 4,
              py: 1.3,
              borderRadius: 3,
              fontWeight: 600,
            }}
          >
            Contact Sales
          </Button>
        </Box>
        {/* PRICING CARDS */}
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="stretch"
        >
          {loading ? (
            <Typography mt={4}>Loading plans...</Typography>
          ) : plans.length === 0 ? (
            <Typography mt={4}>No plans available at the moment.</Typography>
          ) : (
            plans.map((plan, i) => (
            <Grid
              key={i}
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Card
                sx={{
                  width: 320,
                  height: 480,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  border: plan.recommended
                    ? "1px solid black"
                    : "1px solid #ddd",
                  transition: "0.3s ease",
                  "&:hover": {
                    border: "1px solid black",
                    transform: "translateY(-6px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {plan.recommended && (
                    <Typography
                      sx={{
                        bgcolor: "primary.main",
                        color: "#fff",
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: 12,
                        width: "fit-content",
                        mb: 1,
                      }}
                    >
                      Recommended
                    </Typography>
                  )}

                  <Typography variant="h6" fontWeight={700}>
                    {plan.title}
                  </Typography>

                  <Typography variant="h4" fontWeight={800} mt={1}>
                    {plan.price}
                  </Typography>

                  <Typography color="text.secondary" mt={1}>
                    {plan.subtitle}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ flex: 1 }}>
                    {plan.features.map((f, idx) => (
                      <Typography key={idx} fontSize={14} sx={{ mb: 1 }}>
                        • {f}
                      </Typography>
                    ))}
                  </Box>

                  <Button
                    fullWidth
                    variant={plan.recommended ? "contained" : "outlined"}
                    sx={{ mt: "auto" }}
                    onClick={() =>
                      plan.title === "Enterprise Plan"
                        ? navigate("/contact-us")
                        : navigate("/login")
                    }
                  >
                    {plan.title === "Enterprise Plan"
                      ? "Contact Sales"
                      : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )))}
        </Grid>

        {/* COST COMPARISON */}
        <Box sx={{ px: { xs: 2, md: 10 }, py: 6 }}>
          <Typography variant="h2" fontWeight={700} textAlign="center">
            Cost Comparison
          </Typography>
          <Typography color="text.secondary" mt={1} textAlign="center">
            See how much you save by switching from traditional photoshoots.
          </Typography>
          <Grid container spacing={4} mt={2} justifyContent="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 3,
                  bgcolor: "#fff3f3",
                  height: "100%",
                  width: "100%",
                }}
              >
                <Typography fontWeight={700}>Traditional Photoshoot</Typography>
                <Typography mt={1}>• Studio cost</Typography>
                <Typography>• Photographer charges</Typography>
                <Typography>• Models required</Typography>
                <Typography>• Days of work</Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 3,
                  bgcolor: "#f3fff5",
                  height: "100%",
                  width: "100%",
                }}
              >
                <Typography fontWeight={700}>
                  AI Product Shoot (AIVX)
                </Typography>
                <Typography mt={1}>• Instant generation</Typography>
                <Typography>• No studio required</Typography>
                <Typography>• No models needed</Typography>
                <Typography>• 90% cost saving</Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
        {/* FAQ */}
        <Box mt={10}>
          <Typography variant="h2" fontWeight={700} textAlign="center">
            Frequently Asked Questions
          </Typography>
          <Typography color="text.secondary" mt={1} textAlign="center">
            Everything you need to know about AIVX pricing and usage.
          </Typography>
          <Box mt={3}>
            {[
              {
                q: "What is included in image pricing?",
                a: "AI-generated studio-quality images with selected themes and formats, ready for ecommerce and marketing use.",
              },
              {
                q: "What video lengths are supported?",
                a: "We support high-quality 5-second and 15-second product videos optimized for reels and ads.",
              },
              {
                q: "Can I use the images and videos for commercial purposes?",
                a: "Yes. All generated images and videos can be used for ecommerce, ads, and branding.",
              },
              {
                q: "Do I need professional product photos to start?",
                a: "No. A simple product image is enough to generate high-quality outputs.",
              },
              {
                q: "Are there any hidden costs?",
                a: "No. Pricing is transparent with no hidden charges.",
              },
            ].map((item, i) => (
              <Card
                key={i}
                sx={{
                  mb: 2,
                  p: 2,
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { boxShadow: 3 },
                }}
                onClick={() => toggleFAQ(i)}
              >
                {/* QUESTION */}
                <Typography fontWeight={600}>{item.q}</Typography>

                {/* ANSWER (TOGGLE) */}
                {openIndex === i && (
                  <Typography mt={1} color="text.secondary">
                    {item.a}
                  </Typography>
                )}
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      <Footer />
    </>
  );
}
