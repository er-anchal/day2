import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Timeline as TimelineIcon,
  HelpOutline as HelpIcon,
  Autorenew as ResetIcon,
  CallMissedOutgoing as FallbackIcon,
  CheckCircleOutline as ApprovedIcon,
  Block as DismissedIcon,
  ThumbsUpDown as SentimentIcon,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import { useAuth } from "./auth/AuthContext";
import { useThemeContext } from "../context/ThemeContext";

export default function ChatbotAnalytics() {
  const { token } = useAuth();
  const { cardColor, textColor, darkMode, borderColor } = useThemeContext();

  const [loading, setLoading] = useState(true);
  const [miningLoading, setMiningLoading] = useState(false);
  const [kpis, setKpis] = useState({
    totalSessions: 0,
    totalAiQueries: 0,
    totalPredefinedClicks: 0,
    totalFallbacks: 0,
    averageSentiment: 0,
  });
  const [trends, setTrends] = useState([]);
  const [topFlows, setTopFlows] = useState([]);
  const [dropoffs, setDropoffs] = useState([]);
  const [confusedQueries, setConfusedQueries] = useState([]);
  const [faqSuggestions, setFaqSuggestions] = useState([]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const apiBase = `${import.meta.env.VITE_API_URL}/analytics`;

      const [resKpis, resTrends, resTopFlows, resDropoffs, resConfusion, resSuggestions] = 
        await Promise.all([
          axios.get(`${apiBase}/dashboard`, { headers }),
          axios.get(`${apiBase}/trends`, { headers }),
          axios.get(`${apiBase}/top-flows`, { headers }),
          axios.get(`${apiBase}/dropoff`, { headers }),
          axios.get(`${apiBase}/confusion`, { headers }),
          axios.get(`${apiBase}/recommendations`, { headers }),
        ]);

      setKpis(resKpis.data.data);
      setTrends(resTrends.data.data);
      setTopFlows(resTopFlows.data.data);
      setDropoffs(resDropoffs.data.data);
      setConfusedQueries(resConfusion.data.data);
      setFaqSuggestions(resSuggestions.data.data);
    } catch (error) {
      console.error("Failed to load dashboard analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteFAQ = async (item) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const flowPayload = {
        id: item.clusterName.toLowerCase().replace(/\s+/g, "_"),
        question: item.suggestedQuestion,
        answer: item.suggestedAnswer,
        followUps: ["main"],
        isReset: false
      };

      // 1. Promote to live predefined chatbot flows
      await axios.post(`${import.meta.env.VITE_API_URL}/chatbot/flows`, flowPayload, { headers });

      // 2. Filter suggestion out locally in UI
      setFaqSuggestions((prev) => prev.filter((faq) => faq.clusterName !== item.clusterName));
      alert(`Successfully promoted "${item.suggestedQuestion}" to active dialogue flow trees!`);
    } catch (error) {
      console.error("Failed to promote suggested FAQ:", error);
      alert("Failed to promote FAQ: " + (error.response?.data?.error || error.message));
    }
  };

  const handleTriggerMining = async () => {
    setMiningLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/analytics/mine-faqs`, {}, { headers });
      
      alert(response.data.message || "Analysis complete!");
      fetchAnalyticsData(); // Reload list
    } catch (error) {
      console.error("Mining pipeline failed:", error);
      alert("Failed to mine FAQs: " + (error.response?.data?.error || error.message));
    } finally {
      setMiningLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalyticsData();
    }
  }, [token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, bgcolor: "transparent", color: textColor }}>
      
      {/* HEADER BANNER */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: "-0.5px", textAlign: "left" }}>
            Chatbot Command Center
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left" }}>
            Live engagement metrics, AI intent analysis, dropoff funnels, and optimized suggestions.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={handleTriggerMining}
            disabled={miningLoading}
            sx={{
              color: darkMode ? "#c6ff00" : "#1976d2",
              borderColor: darkMode ? "rgba(198, 255, 0, 0.4)" : "rgba(25, 118, 210, 0.4)",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 3,
              "&:hover": { borderColor: darkMode ? "#c6ff00" : "#1976d2" },
            }}
          >
            {miningLoading ? "Analyzing Prompts..." : "Trigger AI Mining"}
          </Button>
          <Button
            variant="contained"
            onClick={fetchAnalyticsData}
            sx={{
              bgcolor: darkMode ? "#c6ff00" : "#1976d2",
              color: darkMode ? "#000" : "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 3,
              "&:hover": { bgcolor: darkMode ? "#b2e600" : "#1565c0" },
            }}
          >
            Refresh Dashboard
          </Button>
        </Box>
      </Box>

      {/* KPI METRIC CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Active Sessions", value: kpis.totalSessions, icon: <TimelineIcon />, color: "#0088FE" },
          { label: "AI Custom Queries", value: kpis.totalAiQueries, icon: <HelpIcon />, color: "#00C49F" },
          { label: "Guided Interactions", value: kpis.totalPredefinedClicks, icon: <ResetIcon />, color: "#FFBB28" },
          { label: "Fallback Redirections", value: kpis.totalFallbacks, icon: <FallbackIcon />, color: "#FF8042" },
          { label: "User Sentiment", value: `${(kpis.averageSentiment * 100).toFixed(1)}%`, icon: <SentimentIcon />, color: "#8884d8" },
        ].map((kpi, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card
              sx={{
                bgcolor: cardColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
                boxShadow: "none",
                background: darkMode 
                  ? `linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%)`
                  : `linear-gradient(135deg, rgba(0, 0, 0, 0.01) 0%, rgba(0, 0, 0, 0.03) 100%)`,
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Box sx={{ color: kpi.color, p: 1, borderRadius: 2, bgcolor: "rgba(0,0,0,0.05)", display: "flex" }}>
                    {kpi.icon}
                  </Box>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary">
                    LIVE
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" align="left">
                  {kpi.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="left">
                  {kpi.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* TREND AND COMPREHENSIVE CHARTS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Graph 1: Conversation Ingest Trends */}
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: cardColor, border: `1px solid ${borderColor}`, borderRadius: 4, boxShadow: "none" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textAlign: "left" }}>
                Conversational Interactions (Last 30 Days)
              </Typography>
              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C49F" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                    <XAxis dataKey="date" stroke={textColor} opacity={0.6} />
                    <YAxis stroke={textColor} opacity={0.6} />
                    <ChartTooltip contentStyle={{ backgroundColor: cardColor, color: textColor }} />
                    <Area type="monotone" dataKey="aiQueries" stroke="#00C49F" fillOpacity={1} fill="url(#colorAi)" name="AI Queries" />
                    <Area type="monotone" dataKey="predefinedClicks" stroke="#0088FE" fillOpacity={1} fill="url(#colorClicks)" name="Flow Clicks" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graph 2: AI Queries vs. Guided Clicks Ratios */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: cardColor, border: `1px solid ${borderColor}`, borderRadius: 4, boxShadow: "none", height: "100%" }}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <Typography variant="h6" fontWeight="bold" sx={{ textAlign: "left" }}>
                Interactions Breakdown
              </Typography>
              <Box sx={{ width: "100%", height: 220, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "AI Queries", value: kpis.totalAiQueries || 1 },
                        { name: "Guided Clicks", value: kpis.totalPredefinedClicks || 1 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#00C49F" />
                      <Cell fill="#0088FE" />
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box display="flex" justifyContent="space-around" sx={{ mt: 2 }}>
                <Box textAlign="center">
                  <Typography variant="subtitle2" color="#00C49F" fontWeight="bold">
                    {((kpis.totalAiQueries / (kpis.totalAiQueries + kpis.totalPredefinedClicks || 1)) * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">AI Generative</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle2" color="#0088FE" fontWeight="bold">
                    {((kpis.totalPredefinedClicks / (kpis.totalAiQueries + kpis.totalPredefinedClicks || 1)) * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Guided Click</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ANALYSIS OF WEAK AREAS: DROPOFFS, CONFUSED QUERIES & SUGGESTED FAQ PIPELINES */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Panel 1: Top Dropoffs & Confusion areas */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: cardColor, border: `1px solid ${borderColor}`, borderRadius: 4, boxShadow: "none" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textAlign: "left" }}>
                High Friction Drop-off Nodes
              </Typography>
              <TableContainer component={Box}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: textColor, fontWeight: "bold" }}>Dialogue ID</TableCell>
                      <TableCell sx={{ color: textColor, fontWeight: "bold" }} align="right">Dropoff Volume</TableCell>
                      <TableCell sx={{ color: textColor, fontWeight: "bold" }} align="right">Severity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dropoffs.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ color: textColor }}>
                          <Chip label={item.flowId} size="small" variant="outlined" sx={{ color: textColor, borderColor }} />
                        </TableCell>
                        <TableCell sx={{ color: textColor }} align="right">{item.dropoffCount}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={item.dropoffCount > 20 ? "High" : "Medium"} 
                            color={item.dropoffCount > 20 ? "error" : "warning"}
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {dropoffs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ color: "text.secondary", py: 4 }}>
                          No high-friction dropoffs recorded.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel 2: Confusing AI Queries */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: cardColor, border: `1px solid ${borderColor}`, borderRadius: 4, boxShadow: "none" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textAlign: "left" }}>
                Confusing Queries (Fallback Triggers)
              </Typography>
              <TableContainer component={Box}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: textColor, fontWeight: "bold" }}>Raw User Query</TableCell>
                      <TableCell sx={{ color: textColor, fontWeight: "bold" }} align="right">Friction Hits</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {confusedQueries.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ color: textColor, fontFamily: "monospace", textAlign: "left" }}>"{item.query}"</TableCell>
                        <TableCell sx={{ color: textColor }} align="right">{item.count}</TableCell>
                      </TableRow>
                    ))}
                    {confusedQueries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ color: "text.secondary", py: 4 }}>
                          No confused queries reported.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DYNAMIC RECOMMENDATIONS AND AUTO GENERATED FAQ PANEL */}
      <Card sx={{ bgcolor: cardColor, border: `1px solid ${borderColor}`, borderRadius: 4, boxShadow: "none" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, textAlign: "left" }}>
            AI-Engine Suggested FAQ Optimizations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "left" }}>
            These QA flows were automatically designed and clustered by Gemini AI based on unresolved custom prompts.
          </Typography>

          <Grid container spacing={3}>
            {faqSuggestions.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    bgcolor: "rgba(255, 255, 255, 0.01)",
                    borderColor: borderColor,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  <Box>
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                        Topic: {item.clusterName}
                      </Typography>
                      <Chip label={`${item.hitCount} Matches`} size="small" color="secondary" />
                    </Box>
                    
                    <Typography variant="body1" fontWeight="bold" sx={{ mb: 1, textAlign: "left" }}>
                      Q: {item.suggestedQuestion}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: "pre-line", textAlign: "left" }}>
                      A: {item.suggestedAnswer}
                    </Typography>

                    <Divider sx={{ my: 1.5, borderColor }} />
                    
                    <Typography variant="caption" color="text.secondary" align="left" display="block">
                      <strong>Sample Prompts Analyzed:</strong>
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                      {item.sampleQueries.map((q, qIdx) => (
                        <Chip key={qIdx} label={`"${q}"`} size="small" sx={{ fontSize: "0.75rem", bgcolor: "rgba(0,0,0,0.05)", color: textColor }} />
                      ))}
                    </Box>
                  </Box>

                  <Box display="flex" gap={1} sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ApprovedIcon />}
                      onClick={() => handlePromoteFAQ(item)}
                      sx={{ textTransform: "none", bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
                    >
                      Promote to Predefined Flow
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
            {faqSuggestions.length === 0 && (
              <Box sx={{ width: "100%", textAlign: "center", py: 6 }}>
                <Typography color="text.secondary">
                  No optimization suggestions available. Check back soon!
                </Typography>
              </Box>
            )}
          </Grid>
        </CardContent>
      </Card>
      
    </Box>
  );
}
