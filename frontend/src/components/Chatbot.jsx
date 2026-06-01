import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Avatar,
  Stack,
  Button,
  Zoom,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  SmartToy as RobotIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SupportAgent as AgentIcon,
  PlayArrow as PlayIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  DeleteSweep as DeleteSweepIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../pages/auth/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import useTracker from "./useTracker";

const resolveMediaUrl = (url) => {
  if (!url) return "";
  const cleanUrl = url.replace("localhost:5000", "localhost:5001");
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }
  const apiBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:5001";
  return `${apiBase}${cleanUrl}`;
};

// Flat Hierarchical Predefined Questions Map
const CHATBOT_FLOWS = {
  main: {
    id: "main",
    question: "Return to Main Menu",
    answer: "Returning to the main options. Choose a topic below for instant support or ask a custom question:",
    followUps: ["canvas_main", "trendy_main", "jewellery_main", "video_main", "pricing_main", "enhancer_main"],
    isReset: true
  },
  canvas_main: {
    id: "canvas_main",
    question: "How to use the Design Canvas?",
    answer: "The Design Canvas (Fabric.js) allows you to create professional social media graphics:\n1. Choose a layout category or template preset (Square Post: 1080x1080, or Banner: 1200x400) from the admin panel.\n2. Add Textbox elements using the toolbar, and customize their font families, sizing, colors, and line alignments.\n3. Add SVG vectors or geometric Shapes (like Rectangles or Circles) and adjust their border strokes.\n4. Upload your custom images or layer videos directly onto the designer surface.",
    followUps: ["canvas_shortcuts", "canvas_crop", "main"]
  },
  canvas_shortcuts: {
    id: "canvas_shortcuts",
    question: "What Keyboard Shortcuts are supported on Canvas?",
    answer: "You can quickly organize and reorder element layers on the Design Canvas with these shortcuts:\n- **Ctrl + ]** (Cmd + ] on Mac) to bring the selected element one step forward.\n- **Ctrl + [** (Cmd + [ on Mac) to send the selected element one step backward.\n- Select an element and press **Delete** or **Backspace** to instantly remove it.",
    followUps: ["canvas_crop", "main"]
  },
  canvas_crop: {
    id: "canvas_crop",
    question: "How do I crop images on the Canvas?",
    answer: "To crop an image on the Canvas:\n1. Click on the target image to select it.\n2. Click the **Crop** button on the control panel.\n3. Left-click and drag a selection rectangle over the portion of the image you want to keep.\n4. Release or click Apply to automatically crop and clip the image into that bounds.",
    followUps: ["canvas_shortcuts", "main"]
  },
  trendy_main: {
    id: "trendy_main",
    question: "What is the Trendy AI Avatar Generator?",
    answer: "The Trendy AI generator transforms uploaded portrait photos into stylized art figures using advanced AI modeling:\n1. **Collectible Figurine**: Formats your model inside a premium Bandai/Funko Pop display box.\n2. **3D Claymation**: Renders a cute smooth-clay avatar seated atop glowing social media icons.\n3. **Watercolor Anime**: Renders a gorgeous hand-painted watercolor anime portrait.",
    followUps: ["trendy_skin", "trendy_pipeline", "main"]
  },
  trendy_skin: {
    id: "trendy_skin",
    question: "How does the Anime AI preserve skin tones?",
    answer: "Traditional AI filters frequently struggle with ethnic skin tones. Our Trendy AI generator integrates custom bias-correction prompt rules. These force the generative engine to strictly retain the exact skin tone extracted from your original photo, rendering dark, medium, and brown skin tones accurately using warm watercolor washes.",
    followUps: ["trendy_pipeline", "main"]
  },
  trendy_pipeline: {
    id: "trendy_pipeline",
    question: "How does the AI process my Trendy photo?",
    answer: "When you upload a portrait:\n1. **Gemini AI** performs a structured inspection, extracting features (skin tone, face shape, hair style, garment layers, and accessories).\n2. A detailed prompt is built automatically based on these traits.\n3. The prompt is sent to **Flux** via Pollinations. If the queue is busy, the backend automatically retries using a premium **Google Imagen 4** fallback route.",
    followUps: ["trendy_skin", "main"]
  },
  jewellery_main: {
    id: "jewellery_main",
    question: "How to use the Jewellery Try-On AI?",
    answer: "Our Jewellery Try-On AI overlays jewellery ornaments onto realistic human models seamlessly:\n1. Navigate to the **Jewellery Generator** page.\n2. Choose an ornament type (Ring, Bangle, Pendant, or Ring & Bangle combination).\n3. Pick your model skin tone (White Fair, Medium, Olive, Brown, Black) or tabletop display scenery.\n4. Upload your own jewellery item or select from our preloaded high-definition samples.\n5. Click **Generate** to view the item blended onto the model's hand, arm, or chest.",
    followUps: ["jewellery_fail", "main"]
  },
  jewellery_fail: {
    id: "jewellery_fail",
    question: "What if the Jewellery Try-On fails to generate?",
    answer: "If you receive a 'busy engine' error:\n1. The AI generation queue is temporarily experiencing high traffic.\n2. Please wait 10-15 seconds and click **Re-Generate**.\n3. Make sure your uploaded image is clear and contains a single jewellery item on a plain background for optimal catalog extraction.",
    followUps: ["jewellery_main", "main"]
  },
  video_main: {
    id: "video_main",
    question: "How to edit Videos and Reels?",
    answer: "The Video Editor harnesses server-side FFmpeg processing to run professional adjustments:\n1. **Trim Video**: Cut and crop time ranges by specifying precise start/end timestamps.\n2. **Crop Video**: Adjust visual dimensions and crop spatial boundaries.\n3. **Burn Subtitles**: Type custom subtitling tracks and burn them in with customized colors and sizes.\n4. **Merge Clips**: Select multiple video files and merge them sequentially into a single MP4.",
    followUps: ["video_subtitles", "main"]
  },
  video_subtitles: {
    id: "video_subtitles",
    question: "How are custom video subtitles rendered?",
    answer: "When you add custom subtitles:\n1. You specify text, timeline ranges (in seconds), font sizes, and custom colors.\n2. The server-side FFmpeg pipeline overlays these using a dedicated `drawtext` layer.\n3. It draws a semi-transparent black backing box to ensure your subtitles remain highly legible regardless of light or complex video backdrops.",
    followUps: ["video_main", "main"]
  },
  pricing_main: {
    id: "pricing_main",
    question: "What Subscription Plans are available?",
    answer: "We offer tailored plans to scale your design capabilities:\n- **Free Plan**: Access to standard canvas features, basic templates, and standard processing speed.\n- **Pro Plan**: Unlocks all premium templates, priority generation for Trendy AI and Jewellery Try-On, full HD video exporting, and unlimited background removals.\n- **Enterprise Plan**: For agencies needing dedicated API speeds, multi-user role access controls, and customized template systems.",
    followUps: ["pricing_upgrade", "main"]
  },
  pricing_upgrade: {
    id: "pricing_upgrade",
    question: "How do I upgrade to Pro/Premium?",
    answer: "To upgrade to a premium plan:\n1. Click on **Pricing** in the navigation bar.\n2. Browse our available plans and click the **Subscribe** button on your preferred tier.\n3. Complete the checkout process to instantly activate premium AI capabilities and higher export limits on your account.",
    followUps: ["pricing_main", "main"]
  },
  enhancer_main: {
    id: "enhancer_main",
    question: "How to use the Image Enhancer?",
    answer: "Our premium Image Enhancer utilizes advanced AI super-resolution algorithms:\n1. Navigate to the **Enhancer** page from the sidebar or menu.\n2. Upload any low-resolution, blurred, or noisy image.\n3. The AI model will process the image, perform automatic denoising, sharpen fine details, and upscale it up to 4x while preserving natural textures.\n4. Download your enhanced high-definition image instantly.",
    followUps: ["main"]
  }
};

export default function Chatbot() {
  const { token, user } = useAuth();
  const { darkMode, bgColor, cardColor, textColor, borderColor } = useThemeContext();

  const userKey = user ? (user.email || user._id || user.id) : null;

  const [sessionId, setSessionId] = useState(() => {
    if (!userKey) return "";
    return `session_${userKey.replace(/[^a-zA-Z0-9]/g, "_")}`;
  });

  useEffect(() => {
    if (!userKey) {
      setSessionId("");
      return;
    }
    setSessionId(`session_${userKey.replace(/[^a-zA-Z0-9]/g, "_")}`);
  }, [userKey]);

  // 7-day chat history maintenance check
  useEffect(() => {
    if (!userKey) return;
    const timestampKey = `chatbot_session_timestamp_${userKey}`;
    const savedTime = localStorage.getItem(timestampKey);
    if (savedTime) {
      const parsedTime = parseInt(savedTime, 10);
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (now - parsedTime > sevenDaysMs) {
        console.log("[Chatbot] History older than 7 days. Clearing local chat history.");
        // Clear history but PRESERVE session ID to prevent redundancy
        localStorage.removeItem(`chatbot_history_${userKey}`);
        setMessages([
          {
            role: "model",
            text: "Hello! I am your AI Design Assistant. I can help you with questions about the canvas editor, trendy templates, jewellery try-on, and video editor.\n\nChoose a topic below or type any custom question to get started!",
            isGreeting: true,
          },
        ]);
        // Update timestamp for new 7-day cycle
        localStorage.setItem(timestampKey, now.toString());
      }
    } else {
      localStorage.setItem(timestampKey, Date.now().toString());
    }
  }, [userKey]);

  const { track } = useTracker(sessionId, token);

  const [isOpen, setIsOpen] = useState(false);
  const hasOpenedRef = useRef(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMessagesCountRef = useRef(0);

  // Reset unread count when widget is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Fetch conversation history from backend Mongoose in real-time (polling)
  const fetchHistory = async () => {
    if (!token || !sessionId) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/chatbot/history/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success && Array.isArray(response.data.messages)) {
        const dbMsgs = response.data.messages;
        if (dbMsgs.length > 0) {
          // Calculate unread counts from new admin replies if widget is closed
          if (!isOpen && prevMessagesCountRef.current > 0 && dbMsgs.length > prevMessagesCountRef.current) {
            const newMsgs = dbMsgs.slice(prevMessagesCountRef.current);
            const newAdminMsgs = newMsgs.filter((m) => m.role === "admin");
            if (newAdminMsgs.length > 0) {
              setUnreadCount((prev) => prev + newAdminMsgs.length);
            }
          }
          prevMessagesCountRef.current = dbMsgs.length;

          // Preserve our greeting bubble at the top if not stored in DB
          setMessages([
            {
              role: "model",
              text: "Hello! I am your AI Design Assistant. I can help you with questions about the canvas editor, trendy templates, jewellery try-on, and video editor.\n\nChoose a topic below or type any custom question to get started!",
              isGreeting: true,
            },
            ...dbMsgs
          ]);
        }
      }
    } catch (error) {
      console.error("[Chatbot Widget] History sync failed:", error);
    }
  };

  // Fetch history on initialization
  useEffect(() => {
    if (token && sessionId) {
      fetchHistory();
    }
  }, [token, sessionId]);

  // Periodic polling for administrative replies when open
  useEffect(() => {
    if (!token || !isOpen || !sessionId) return;
    const interval = setInterval(() => {
      fetchHistory();
    }, 4000);
    return () => clearInterval(interval);
  }, [token, isOpen, sessionId]);

  useEffect(() => {
    if (token) {
      if (isOpen) {
        track("CHAT_OPEN");
        hasOpenedRef.current = true;
      } else if (hasOpenedRef.current) {
        track("CHAT_CLOSE");
      }
    }
  }, [isOpen, token]);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! I am your AI Design Assistant. I can help you with questions about the canvas editor, trendy templates, jewellery try-on, and video editor.\n\nChoose a topic below or type any custom question to get started!",
      isGreeting: true,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Stores all dynamic flows as a dictionary map (constructed from array fetched from DB)
  const [allFlowsMap, setAllFlowsMap] = useState({});

  // Tracks the list of active predefined helper options
  const [predefinedOptions, setPredefinedOptions] = useState(
    CHATBOT_FLOWS.main.followUps.map((key) => CHATBOT_FLOWS[key]).filter(Boolean)
  );

  const loadedUserKeyRef = useRef(null);

  // Load user's chat history when userKey changes
  useEffect(() => {
    if (!userKey) {
      loadedUserKeyRef.current = null;
      return;
    }

    const historyKey = `chatbot_history_${userKey}`;
    const saved = localStorage.getItem(historyKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          setMessages([
            {
              role: "model",
              text: "Hello! I am your AI Design Assistant. I can help you with questions about the canvas editor, trendy templates, jewellery try-on, and video editor.\n\nChoose a topic below or type any custom question to get started!",
              isGreeting: true,
            },
          ]);
        }
      } catch (e) {
        console.error("[Chatbot] Failed to parse chatbot history", e);
      }
    } else {
      setMessages([
        {
          role: "model",
          text: "Hello! I am your AI Design Assistant. I can help you with questions about the canvas editor, trendy templates, jewellery try-on, and video editor.\n\nChoose a topic below or type any custom question to get started!",
          isGreeting: true,
        },
      ]);
    }
    loadedUserKeyRef.current = userKey;
  }, [userKey]);

  // Save chat history when messages or userKey changes
  useEffect(() => {
    if (userKey && loadedUserKeyRef.current === userKey) {
      localStorage.setItem(`chatbot_history_${userKey}`, JSON.stringify(messages));
    }
  }, [messages, userKey]);

  const messagesEndRef = useRef(null);

  // Fetch dynamic database-backed Q&A flows on token and open state change
  useEffect(() => {
    const fetchDynamicFlows = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/chatbot/flows`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.success && response.data.flows) {
          const flowsArr = response.data.flows;
          const flowMap = {};
          flowsArr.forEach((item) => {
            flowMap[item.id] = item;
          });
          setAllFlowsMap(flowMap);

          // Update active option list based on database definition of 'main' menu follow-ups
          const mainFlow = flowMap["main"];
          if (mainFlow && mainFlow.followUps) {
            const initialChoices = mainFlow.followUps
              .map((key) => flowMap[key])
              .filter(Boolean);
            setPredefinedOptions(initialChoices);
          }
        }
      } catch (error) {
        console.error("[Chatbot] Dynamic fetch failed. Falling back to local static flows:", error);
        // Resilient fallback to static map
        setAllFlowsMap(CHATBOT_FLOWS);
        const initialChoices = CHATBOT_FLOWS.main.followUps
          .map((key) => CHATBOT_FLOWS[key])
          .filter(Boolean);
        setPredefinedOptions(initialChoices);
      }
    };

    if (token && isOpen) {
      fetchDynamicFlows();
    }
  }, [token, isOpen]);

  const scrollContainerRef = useRef(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 80;
    setShowScrollArrow(isScrolledUp);
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      // Only auto-scroll to bottom if the last message was sent by the user!
      if (lastMsg.role === "user") {
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [messages, isOpen]);

  // Handle predefined quick question clicks (with hierarchical sub-menu navigation)
  const handlePredefinedClick = (qObj) => {
    track("PREDEFINED_CLICK", { flowId: qObj.id });
    track("FLOW_TRANSITION", { flowId: qObj.id, targetFlowId: qObj.followUps?.[0] || "main" });

    // 1. Temporarily clear selections to block rapid multi-clicks
    setPredefinedOptions([]);

    // 2. Push user query bubble
    setMessages((prev) => [...prev, { role: "user", text: qObj.question }]);
    setIsTyping(true);

    // 3. Render answer and load sub-questions after organic delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: qObj.answer,
          photoUrl: qObj.photoUrl,
          videoUrl: qObj.videoUrl,
          pdfUrl: qObj.pdfUrl,
        }
      ]);
      setIsTyping(false);

      // Determine active flow definition map
      const currentFlows = Object.keys(allFlowsMap).length > 0 ? allFlowsMap : CHATBOT_FLOWS;

      // Determine follow-up sub-questions
      if (qObj.isReset) {
        // Return to main menu
        const mainFlow = currentFlows["main"];
        const mainFollowUps = mainFlow && mainFlow.followUps
          ? mainFlow.followUps.map((k) => currentFlows[k]).filter(Boolean)
          : [];
        setPredefinedOptions(mainFollowUps);
      } else if (qObj.followUps && qObj.followUps.length > 0) {
        // Map follow-up keys directly using flow map
        const loadedFollowUps = qObj.followUps.map((key) => currentFlows[key]).filter(Boolean);
        setPredefinedOptions(loadedFollowUps);
      } else {
        // Default fallback to main menu options
        const mainFlow = currentFlows["main"];
        const mainFollowUps = mainFlow && mainFlow.followUps
          ? mainFlow.followUps.map((k) => currentFlows[k]).filter(Boolean)
          : [];
        setPredefinedOptions(mainFollowUps);
      }
    }, 600);
  };

  // Handle custom query sending
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    track("AI_QUERY", { rawQuery: userText });

    // Push user message to state
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsTyping(true);

    // Temporarily clear predefined chips during active AI synthesis
    setPredefinedOptions([]);

    try {
      // Format chat history for Gemini API
      const formattedHistory = messages
        .filter((msg) => !msg.isGreeting)
        .map((msg) => ({
          role: msg.role,
          text: msg.text,
        }));

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chatbot/query`,
        { message: userText, history: formattedHistory, sessionId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const aiReply = response.data?.reply;

      setMessages((prev) => [
        ...prev,
        { role: "model", text: aiReply || "Sorry, I could not generate a response." },
      ]);
    } catch (error) {
      console.error("Chatbot query failed:", error);
      track("FALLBACK_TRIGGERED", { rawQuery: userText });
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "I am having trouble connecting to my AI services right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
      fetchHistory();
      // Restore main menu options after custom search
      const currentFlows = Object.keys(allFlowsMap).length > 0 ? allFlowsMap : CHATBOT_FLOWS;
      const mainFlow = currentFlows["main"];
      const mainFollowUps = mainFlow && mainFlow.followUps
        ? mainFlow.followUps.map((k) => currentFlows[k]).filter(Boolean)
        : [];
      setPredefinedOptions(mainFollowUps);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Hide the chatbot completely if the user is not authenticated
  if (!token) return null;

  return (
    <Box sx={{ zIndex: 1250, position: "relative" }}>
      {/* 🚀 FLOATING ACTION BUTTON */}
      <Zoom in={true}>
        <IconButton
          onClick={() => setIsOpen((prev) => !prev)}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 56,
            height: 56,
            zIndex: 1250,
            boxShadow: darkMode
              ? "0 4px 20px rgba(198, 255, 0, 0.3)"
              : "0 4px 20px rgba(25, 118, 210, 0.3)",
            bgcolor: darkMode ? "#c6ff00" : "#1976d2",
            color: darkMode ? "#000000" : "#ffffff",
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            "&:hover": {
              bgcolor: darkMode ? "#b2e600" : "#1565c0",
              transform: "scale(1.1) rotate(15deg)",
            },
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            variant={unreadCount > 0 && !isOpen ? "standard" : "dot"}
            badgeContent={unreadCount > 0 && !isOpen ? unreadCount : undefined}
            color={unreadCount > 0 && !isOpen ? "error" : "success"}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: unreadCount > 0 && !isOpen ? "#f44336" : "#44b700",
                color: "#ffffff",
                boxShadow: `0 0 0 2px ${darkMode ? "#000" : "#fff"}`,
                "&::after": {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  animation: "ripple 1.2s infinite ease-in-out",
                  border: "1px solid currentColor",
                  content: '""',
                },
              },
              "@keyframes ripple": {
                "0%": { transform: "scale(.8)", opacity: 1 },
                "100%": { transform: "scale(2.4)", opacity: 0 },
              },
            }}
          >
            {isOpen ? <CloseIcon /> : <RobotIcon />}
          </Badge>
        </IconButton>
      </Zoom>

      {/* 💬 CHATBOX WINDOW */}
      <Zoom in={isOpen} style={{ transformOrigin: "bottom right" }}>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: { xs: "calc(100vw - 40px)", sm: 380 },
            height: { xs: "calc(100dvh - 120px)", sm: 500 },
            maxHeight: 600,
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 1240,
            border: `1px solid ${borderColor}`,
            bgcolor: cardColor,
            color: textColor,
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              background: darkMode
                ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                : "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: darkMode ? "rgba(198,255,0,0.15)" : "rgba(255,255,255,0.2)",
                  color: darkMode ? "#c6ff00" : "#ffffff",
                }}
              >
                <AgentIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "#44b700",
                    }}
                  />
                  Online (Active)
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Tooltip title="Clear Chat History" arrow>
                <IconButton 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear your chat history? This clears your screen but preserves your ticket context on the server.")) {
                      localStorage.removeItem(`chatbot_history_${userKey}`);
                      setMessages([
                        {
                          role: "model",
                          text: "Hello! I am your AI Design Assistant. I can help you with questions about the canvas editor, trendy templates, jewellery try-on, and video editor.\n\nChoose a topic below or type any custom question to get started!",
                          isGreeting: true,
                        },
                      ]);
                    }
                  }} 
                  sx={{ color: "#ffffff" }} 
                  size="small"
                >
                  <DeleteSweepIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton onClick={() => setIsOpen(false)} sx={{ color: "#ffffff" }} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* CHAT MESSAGES WRAPPER (Allows absolute floating scroll down button) */}
          <Box sx={{ flexGrow: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* CHAT MESSAGES PANEL */}
            <Box
              ref={scrollContainerRef}
              onScroll={handleScroll}
              sx={{
                flexGrow: 1,
                p: 2,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                bgcolor: darkMode ? "#0c1017" : "#fafafa",
                height: "100%"
              }}
            >
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {/* Speech Bubble */}
                <Box
                  sx={{
                    maxWidth: "85%",
                    p: 1.5,
                    borderRadius: 2,
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    ...(msg.role === "user"
                      ? {
                        bgcolor: darkMode ? "#c6ff00" : "#1976d2",
                        color: darkMode ? "#000000" : "#ffffff",
                        borderBottomRightRadius: 0,
                      }
                      : msg.role === "admin"
                      ? {
                        bgcolor: darkMode ? "#0288d1" : "#e0f7fa",
                        color: darkMode ? "#ffffff" : "#01579b",
                        border: `1px solid ${darkMode ? "#01579b" : "#b2ebf2"}`,
                        borderBottomLeftRadius: 0,
                        boxShadow: "0 0 8px rgba(2, 136, 209, 0.2)",
                      }
                      : {
                        bgcolor: darkMode ? "#1e293b" : "#ffffff",
                        color: textColor,
                        border: `1px solid ${borderColor}`,
                        borderBottomLeftRadius: 0,
                      }),
                  }}
                >
                  {msg.role === "admin" && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 0.5, 
                        fontWeight: 750, 
                        fontSize: "0.7rem", 
                        opacity: 0.9, 
                        mb: 0.5,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}
                    >
                      👨‍💼 Support Agent (Human Takeover)
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ fontSize: "inherit", fontWeight: 500 }}>
                    {msg.text}
                  </Typography>

                  {/* Photo attachment preview */}
                  {msg.photoUrl && (
                    <Box
                      sx={{
                        mt: 1.5,
                        position: "relative",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: `1px solid ${darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
                        cursor: "pointer",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        },
                      }}
                      onClick={() => {
                        track("FILE_VIEW", { fileType: "photo", fileUrl: msg.photoUrl });
                        window.open(resolveMediaUrl(msg.photoUrl), "_blank");
                      }}
                    >
                      <Box
                        component="img"
                        src={resolveMediaUrl(msg.photoUrl)}
                        alt="Photo Preview"
                        sx={{
                          width: "100%",
                          maxHeight: 140,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "#ffffff",
                          px: 1.5,
                          py: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <ImageIcon sx={{ fontSize: 14, color: "#ffffff" }} />
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          Expand Image
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Video attachment preview */}
                  {msg.videoUrl && (
                    <Box
                      sx={{
                        mt: 1.5,
                        position: "relative",
                        borderRadius: "8px",
                        height: 110,
                        background: darkMode
                          ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                          : "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)",
                        border: `1px solid ${darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        },
                      }}
                      onClick={() => {
                        track("VIDEO_PLAY", { fileType: "video", fileUrl: msg.videoUrl });
                        window.open(resolveMediaUrl(msg.videoUrl), "_blank");
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: "rgba(0,0,0,0.75)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        }}
                      >
                        <PlayIcon sx={{ fontSize: 20, color: "#ffffff" }} />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.75,
                          fontWeight: 600,
                          color: darkMode ? "#ffffff" : "#1e293b",
                          fontSize: "0.75rem",
                          px: 2,
                          textAlign: "center",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        Watch Video Guide
                      </Typography>
                    </Box>
                  )}

                  {/* PDF attachment card */}
                  {msg.pdfUrl && (
                    <Box
                      sx={{
                        mt: 1.5,
                        borderRadius: "8px",
                        p: 1,
                        bgcolor: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
                        border: `1px solid ${darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        cursor: "pointer",
                        transition: "transform 0.2s ease, background-color 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.01)",
                          bgcolor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                        },
                      }}
                      onClick={() => {
                        track("PDF_OPEN", { fileType: "pdf", fileUrl: msg.pdfUrl });
                        window.open(resolveMediaUrl(msg.pdfUrl), "_blank");
                      }}
                    >
                      <Box
                        sx={{
                          p: 0.75,
                          borderRadius: "6px",
                          bgcolor: "rgba(239, 68, 68, 0.15)",
                          color: "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PdfIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: msg.role === "user" ? (darkMode ? "#000000" : "#ffffff") : textColor,
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textAlign: "left",
                          }}
                        >
                          View PDF Guide
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.65rem",
                            color: msg.role === "user" ? (darkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)") : "text.secondary",
                            display: "block",
                            textAlign: "left",
                          }}
                        >
                          Click to open document
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}

            {/* TYPING LOADER */}
            {isTyping && (
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    borderBottomLeftRadius: 0,
                    bgcolor: darkMode ? "#1e293b" : "#ffffff",
                    border: `1px solid ${borderColor}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: textColor,
                      animation: "typingPulse 1.2s infinite ease-in-out",
                      "@keyframes typingPulse": {
                        "0%, 100%": { transform: "scale(1)", opacity: 0.4 },
                        "50%": { transform: "scale(1.4)", opacity: 1 },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: textColor,
                      animation: "typingPulse 1.2s infinite ease-in-out 0.2s",
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: textColor,
                      animation: "typingPulse 1.2s infinite ease-in-out 0.4s",
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* DYNAMIC HIERARCHICAL PREDEFINED CHIPS (Rendered at the bottom of the log) */}
            {!isTyping && predefinedOptions.length > 0 && (
              <Stack spacing={1} sx={{ mt: 1, width: "100%", pb: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Select a topic below for instant guidance:
                </Typography>
                {predefinedOptions.map((qObj, qIdx) => (
                  <Button
                    key={qIdx}
                    variant="outlined"
                    size="small"
                    onClick={() => handlePredefinedClick(qObj)}
                    sx={{
                      textTransform: "none",
                      textAlign: "left",
                      justifyContent: "flex-start",
                      py: 0.75,
                      px: 1.5,
                      borderRadius: 2,
                      borderColor: darkMode ? "rgba(198,255,0,0.4)" : "rgba(25, 118, 210, 0.4)",
                      color: darkMode ? "#c6ff00" : "#1976d2",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: darkMode ? "rgba(198,255,0,0.08)" : "rgba(25, 118, 210, 0.08)",
                        borderColor: darkMode ? "#c6ff00" : "#1976d2",
                      },
                    }}
                  >
                    ⚡ {qObj.question}
                  </Button>
                ))}
              </Stack>
            )}

            {/* Anchor for AutoScroll */}
            <div ref={messagesEndRef} />
          </Box>

          {/* Scroll to Bottom Floating Arrow (WhatsApp styled: grey/white with transparency) */}
          {showScrollArrow && (
            <IconButton
              onClick={scrollToBottom}
              sx={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(30, 41, 59, 0.72)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
                zIndex: 20,
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  transform: 'translateX(-50%) scale(1.1)',
                },
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <KeyboardArrowDownIcon sx={{ fontSize: 22 }} />
            </IconButton>
          )}
        </Box>

          {/* INPUT FORM PANEL */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: cardColor,
              borderTop: `1px solid ${borderColor}`,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: darkMode ? "#0c1017" : "#fafafa",
                  "& fieldset": { borderColor: borderColor },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      sx={{
                        color: darkMode ? "#c6ff00" : "#1976d2",
                        "&:hover": {
                          bgcolor: darkMode ? "rgba(198,255,0,0.1)" : "rgba(25, 118, 210, 0.1)",
                        },
                        "&.Mui-disabled": {
                          color: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                        },
                      }}
                    >
                      <SendIcon size="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>
      </Zoom>
    </Box>
  );
}
