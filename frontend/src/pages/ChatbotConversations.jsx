import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Avatar,
  Chip,
  IconButton,
  Button,
  Paper,
  Divider,
  CircularProgress,
  List,
  ListItemButton,
  Badge,
  Tooltip
} from "@mui/material";
import {
  Search as SearchIcon,
  Send as SendIcon,
  Flag as EscalationIcon,
  OfflineBolt as AILeadIcon,
  SupportAgent as TakeoverIcon,
  Bookmark as NoteIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
  ArrowBack as BackIcon,
  EmojiEmotionsOutlined as EmojiIcon,
  AttachFile as AttachIcon,
  FiberManualRecord as ActiveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "./auth/AuthContext";
import { useThemeContext } from "../context/ThemeContext";

// Utility function to format and resolve absolute upload URLs
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

// Robust, safe and premium Markdown parser for AI and User dialogue messages
const formatMessageText = (text) => {
  if (!text) return "";

  const lines = text.split("\n");
  let inCodeBlock = false;
  let codeBlockLines = [];
  const parsedElements = [];

  const parseInlineStyles = (txt, keyPrefix) => {
    if (!txt) return "";
    
    // Parse bold text **bold** and inline code `code`
    const tokens = txt.split(/(\*\*.*?\*\*|`.*?`)/g);
    return tokens.map((token, idx) => {
      const uniqueKey = `${keyPrefix}-${idx}`;
      if (token.startsWith("**") && token.endsWith("**")) {
        return (
          <strong key={uniqueKey} style={{ fontWeight: 800 }}>
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith("`") && token.endsWith("`")) {
        return (
          <code
            key={uniqueKey}
            style={{
              fontFamily: "monospace",
              backgroundColor: "rgba(0, 0, 0, 0.15)",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.85em",
              fontWeight: 700
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  };

  lines.forEach((line, idx) => {
    // 1. Code block handling
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        parsedElements.push(
          <Box
            key={`code-block-${idx}`}
            component="pre"
            sx={{
              bgcolor: "rgba(0,0,0,0.85)",
              color: "#a9ff68",
              p: 1.75,
              borderRadius: 2.5,
              fontFamily: "monospace",
              fontSize: "0.8rem",
              overflowX: "auto",
              textAlign: "left",
              my: 1.5,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)"
            }}
          >
            {codeBlockLines.join("\n")}
          </Box>
        );
        codeBlockLines = [];
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    const trimmed = line.trim();

    // 2. Headers formatting
    if (trimmed.startsWith("### ")) {
      parsedElements.push(
        <Typography key={idx} variant="subtitle2" fontWeight={800} align="left" sx={{ mt: 2, mb: 0.5, letterSpacing: "-0.2px" }}>
          {parseInlineStyles(trimmed.slice(4), idx)}
        </Typography>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      parsedElements.push(
        <Typography key={idx} variant="subtitle1" fontWeight={800} align="left" sx={{ mt: 2, mb: 0.5, letterSpacing: "-0.3px" }}>
          {parseInlineStyles(trimmed.slice(3), idx)}
        </Typography>
      );
      return;
    }
    if (trimmed.startsWith("# ")) {
      parsedElements.push(
        <Typography key={idx} variant="h6" fontWeight={950} align="left" sx={{ mt: 2.5, mb: 1, letterSpacing: "-0.5px" }}>
          {parseInlineStyles(trimmed.slice(2), idx)}
        </Typography>
      );
      return;
    }

    // 3. Bullet list formatting
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      parsedElements.push(
        <Box key={idx} display="flex" alignItems="flex-start" sx={{ ml: 1.5, my: 0.5, textAlign: "left" }}>
          <Typography variant="body2" sx={{ mr: 1, color: "primary.main", fontWeight: 900 }}>•</Typography>
          <Typography variant="body2" sx={{ flexGrow: 1, fontSize: "0.85rem", lineHeight: 1.5 }}>
            {parseInlineStyles(trimmed.slice(2), idx)}
          </Typography>
        </Box>
      );
      return;
    }

    // 4. Numbered list formatting
    const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      parsedElements.push(
        <Box key={idx} display="flex" alignItems="flex-start" sx={{ ml: 1.5, my: 0.5, textAlign: "left" }}>
          <Typography variant="body2" sx={{ mr: 1, fontWeight: 700, minWidth: "16px" }}>
            {numMatch[1]}.
          </Typography>
          <Typography variant="body2" sx={{ flexGrow: 1, fontSize: "0.85rem", lineHeight: 1.5 }}>
            {parseInlineStyles(numMatch[2], idx)}
          </Typography>
        </Box>
      );
      return;
    }

    // 5. Normal paragraphs or spacing
    if (trimmed) {
      parsedElements.push(
        <Typography key={idx} variant="body2" align="left" sx={{ my: 0.5, fontSize: "0.85rem", lineHeight: 1.5 }}>
          {parseInlineStyles(line, idx)}
        </Typography>
      );
    } else {
      parsedElements.push(<Box key={idx} sx={{ height: "8px" }} />);
    }
  });

  return parsedElements;
};

export default function ChatbotConversations() {
  const { token, user } = useAuth();
  const { cardColor, textColor, darkMode, borderColor, bgColor } = useThemeContext();

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  
  // Selected conversation detailed state
  const [chatDetails, setChatDetails] = useState(null);
  const [replyInput, setReplyInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'notes'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'unread', 'unresolved', 'resolved', 'priority'

  // Toggle Right Sidebar (Hidden by default)
  const [showRightPanel, setShowRightPanel] = useState(false);

  // Filter Chips Expansion State
  const [isChipsExpanded, setIsChipsExpanded] = useState(false);

  // Mobile View Screen Breakpoints & Steps
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mobileStep, setMobileStep] = useState("list"); // 'list', 'chat', 'info'

  // Infinite Scroll Pagination
  const [visibleCount, setVisibleCount] = useState(12);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 80;
    setShowScrollArrow(isScrolledUp);
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  // Sync screen width dynamically
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Listen to Escape key to close Right Panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowRightPanel(false);
        if (isMobile && mobileStep === "info") {
          setMobileStep("chat");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, mobileStep]);



  // Fetch conversations (with first-chat default select)
  const fetchConversations = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/conversations`, { headers });
      setConversations(res.data.data);
      if (res.data.data.length > 0 && !selectedChatId) {
        setSelectedChatId(res.data.data[0].conversationId);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatDetails = async (id, shouldScrollForce = false) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/conversations/${id}`, { headers });
      
      const container = scrollContainerRef.current;
      let isNearBottom = true;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        isNearBottom = scrollHeight - scrollTop - clientHeight <= 100;
      }
      
      setChatDetails(res.data.data);
      
      if (shouldScrollForce || isNearBottom) {
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error("Failed to fetch chat details:", error);
    }
  };

  // Poll databases every 4 seconds to sync messages live!
  useEffect(() => {
    if (token) {
      fetchConversations();
    }
    const interval = setInterval(() => {
      if (token) {
        fetchConversations();
        if (selectedChatId) {
          fetchChatDetails(selectedChatId, false); // do NOT force scroll on poll
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [token, selectedChatId]);

  useEffect(() => {
    if (selectedChatId) {
      fetchChatDetails(selectedChatId, true); // force scroll on chat select
    }
  }, [selectedChatId]);

  // Send admin reply
  const handleSendReply = async () => {
    if (!replyInput.trim()) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${import.meta.env.VITE_API_URL}/analytics/conversations/reply`, {
        conversationId: selectedChatId,
        text: replyInput.trim()
      }, { headers });

      setChatDetails((prev) => ({
        ...prev,
        messages: [
          ...(prev?.messages || []),
          {
            conversationId: selectedChatId,
            sender: { role: "admin" },
            text: replyInput.trim(),
            timestamp: new Date()
          }
        ]
      }));

      setReplyInput("");
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Failed to send admin response:", error);
      alert("Failed to send response: " + (error.response?.data?.error || error.message));
    }
  };

  // Submit internal private note
  const handleSubmitNote = async () => {
    if (!noteInput.trim()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/analytics/conversations/note`, {
        conversationId: selectedChatId,
        text: noteInput.trim()
      }, { headers });

      setChatDetails((prev) => ({
        ...prev,
        notes: [res.data.data, ...(prev?.notes || [])]
      }));
      setNoteInput("");
    } catch (error) {
      alert("Failed to submit internal note.");
    }
  };

  // Update conversation status (Open vs Resolved)
  const handleUpdateStatus = async (newStatus) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/analytics/conversations/status`, {
        conversationId: selectedChatId,
        status: newStatus
      }, { headers });

      setChatDetails((prev) => ({
        ...prev,
        conversation: { ...prev.conversation, status: res.data.data.status }
      }));
      fetchConversations();
    } catch (error) {
      alert("Failed to adjust ticket status: " + error.message);
    }
  };

  // Toggle takeover status
  const handleToggleTakeover = async (active) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/analytics/conversations/status`, {
        conversationId: selectedChatId,
        isHumanTakeoverActive: active
      }, { headers });

      setChatDetails((prev) => ({
        ...prev,
        conversation: { ...prev.conversation, isHumanTakeoverActive: res.data.data.isHumanTakeoverActive }
      }));
    } catch (error) {
      alert("Failed to adjust takeover status.");
    }
  };

  // Infinite Scroll loading older logs simulator
  const handleLoadMore = () => {
    setIsInfiniteLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 8);
      setIsInfiniteLoading(false);
    }, 700);
  };

  // Helper to dynamically check priority on real user data
  const isPriority = (item) => {
    if (item.leadScore > 65 || item.status === "Escalated") return true;
    if (item.isHumanTakeoverActive) return true;
    const lastMsg = item.metadata?.lastMessageText?.toLowerCase() || "";
    const keywords = ['pricing', 'pro', 'upgrade', 'premium', 'pay', 'billing', 'subscription', 'price', 'plan', 'enterprise', 'buy', 'cost'];
    if (keywords.some(kw => lastMsg.includes(kw))) return true;
    return false;
  };

  // Filter Conversations based on filter chips and search query
  const filteredConversations = conversations.filter((item) => {
    // 1. Search Query filter
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchesSearch = 
        (item.userProfile?.email && item.userProfile.email.toLowerCase().includes(q)) ||
        (item.userProfile?.name && item.userProfile.name.toLowerCase().includes(q)) ||
        (item.conversationId && item.conversationId.toLowerCase().includes(q)) ||
        (item.metadata?.lastMessageText && item.metadata.lastMessageText.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // 2. Tab Filter chips filter
    if (activeFilter === "unread") {
      return item.metadata && Number(item.metadata.unreadCount) > 0;
    }
    if (activeFilter === "unresolved") {
      return item.status !== "Resolved";
    }
    if (activeFilter === "resolved") {
      return item.status === "Resolved";
    }
    if (activeFilter === "priority") {
      return isPriority(item);
    }
    return true; // 'all'
  });

  // Dynamic filter counters
  const totalCount = conversations.length;
  const unreadCount = conversations.filter(c => c.metadata && Number(c.metadata.unreadCount) > 0).length;
  const unresolvedCount = conversations.filter(c => c.status !== "Resolved").length;
  const resolvedCount = conversations.filter(c => c.status === "Resolved").length;
  const priorityCount = conversations.filter(c => isPriority(c)).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Pure CSS Scrollbar Styles (Subtle transparent background, thin thumbs)
  const globalScrollbarStyles = (
    <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: ${darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)"};
        border-radius: 20px;
        border: 1px solid transparent;
        background-clip: padding-box;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${darkMode ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.25)"};
        border: 1px solid transparent;
        background-clip: padding-box;
      }
      @keyframes activePulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.4); opacity: 1; }
      }
      /* Hide scrollbar completely on mobile viewports (screens smaller than 768px) */
      @media (max-width: 767px) {
        .custom-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .custom-scrollbar {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      }
      /* Hide scrollbar completely for horizontal filter chips bar */
      .chips-scroll-container::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      .chips-scroll-container {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
    `}</style>
  );

  return (
    <Box 
      sx={{ 
        height: {
          xs: "calc(100vh - 56px)",
          sm: "calc(100vh - 64px)"
        }, 
        display: "flex", 
        flexDirection: "row", 
        bgcolor: darkMode ? "#070a0f" : "#f4f6f9", 
        color: textColor, 
        overflow: "hidden", 
        position: "relative",
        width: "100%"
      }}
    >
      {globalScrollbarStyles}

      {/* ================================================================= */}
      {/* 1. LEFT PANEL: CONVERSATIONS LIST (HIDDEN IN MOBILE IF CHAT ACTIVE) */}
      {/* ================================================================= */}
      {(!isMobile || mobileStep === "list") && (
        <Box 
          sx={{ 
            width: isMobile ? "100%" : "340px", 
            minWidth: isMobile ? "100%" : "340px",
            maxWidth: isMobile ? "100%" : "340px",
            borderRight: `1px solid ${borderColor}`, 
            display: "flex", 
            flexDirection: "column", 
            bgcolor: darkMode ? "rgba(10, 15, 26, 0.6)" : "#ffffff", 
            backdropFilter: "blur(20px)",
            height: "100%",
            zIndex: 3
          }}
        >
          {/* Header & Search Area */}
          <Box sx={{ p: 2.5, pb: 1.5, borderBottom: `1px solid ${borderColor}` }}>
            <Typography variant="h6" fontWeight={850} align="left" sx={{ mb: 2, letterSpacing: "-0.5px" }}>
              CRM Inbox
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Search email, text or session ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1, fontSize: 18 }} />
              }}
              sx={{ 
                "& .MuiOutlinedInput-root": { 
                  borderRadius: 3,
                  bgcolor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
                },
                mb: 2
              }}
            />

            {/* Filter Chips (WhatsApp inspired) */}
            <Box display="flex" alignItems="center" width="100%" sx={{ position: "relative" }}>
              <Box 
                className="chips-scroll-container"
                sx={{ 
                  display: "flex", 
                  gap: 0.75, 
                  flexWrap: isChipsExpanded ? "wrap" : "nowrap", 
                  overflowX: isChipsExpanded ? "visible" : "auto", 
                  pb: isChipsExpanded ? 0.5 : 0.5,
                  flexGrow: 1,
                  maxWidth: isChipsExpanded ? "100%" : "calc(100% - 32px)",
                  transition: "max-width 0.2s ease"
                }}
              >
                <Chip 
                  label={`All (${totalCount})`} 
                  size="small" 
                  onClick={() => setActiveFilter("all")}
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: "0.7rem", 
                    bgcolor: activeFilter === "all" ? (darkMode ? "#c6ff00" : "#1976d2") : "transparent",
                    color: activeFilter === "all" ? "#000" : textColor,
                    border: `1px solid ${activeFilter === "all" ? "transparent" : borderColor}`,
                    cursor: "pointer",
                    "&:hover": { opacity: 0.9 },
                    mb: isChipsExpanded ? 0.75 : 0
                  }} 
                />
                <Chip 
                  label={`Unread (${unreadCount})`} 
                  size="small" 
                  onClick={() => setActiveFilter("unread")}
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: "0.7rem", 
                    bgcolor: activeFilter === "unread" ? (darkMode ? "#c6ff00" : "#1976d2") : "transparent",
                    color: activeFilter === "unread" ? "#000" : textColor,
                    border: `1px solid ${activeFilter === "unread" ? "transparent" : borderColor}`,
                    cursor: "pointer",
                    "&:hover": { opacity: 0.9 },
                    mb: isChipsExpanded ? 0.75 : 0
                  }} 
                />
                <Chip 
                  label={`Unresolved (${unresolvedCount})`} 
                  size="small" 
                  onClick={() => setActiveFilter("unresolved")}
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: "0.7rem", 
                    bgcolor: activeFilter === "unresolved" ? (darkMode ? "#c6ff00" : "#1976d2") : "transparent",
                    color: activeFilter === "unresolved" ? "#000" : textColor,
                    border: `1px solid ${activeFilter === "unresolved" ? "transparent" : borderColor}`,
                    cursor: "pointer",
                    "&:hover": { opacity: 0.9 },
                    mb: isChipsExpanded ? 0.75 : 0
                  }} 
                />
                <Chip 
                  label={`Priority (${priorityCount})`} 
                  size="small" 
                  onClick={() => setActiveFilter("priority")}
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: "0.7rem", 
                    bgcolor: activeFilter === "priority" ? (darkMode ? "#c6ff00" : "#1976d2") : "transparent",
                    color: activeFilter === "priority" ? "#000" : textColor,
                    border: `1px solid ${activeFilter === "priority" ? "transparent" : borderColor}`,
                    cursor: "pointer",
                    "&:hover": { opacity: 0.9 },
                    mb: isChipsExpanded ? 0.75 : 0
                  }} 
                />
                <Chip 
                  label={`Resolved (${resolvedCount})`} 
                  size="small" 
                  onClick={() => setActiveFilter("resolved")}
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: "0.7rem", 
                    bgcolor: activeFilter === "resolved" ? (darkMode ? "#c6ff00" : "#1976d2") : "transparent",
                    color: activeFilter === "resolved" ? "#000" : textColor,
                    border: `1px solid ${activeFilter === "resolved" ? "transparent" : borderColor}`,
                    cursor: "pointer",
                    "&:hover": { opacity: 0.9 },
                    mb: isChipsExpanded ? 0.75 : 0
                  }} 
                />
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setIsChipsExpanded(prev => !prev)}
                sx={{ 
                  p: 0.5, 
                  ml: 0.5, 
                  color: "text.secondary",
                  alignSelf: isChipsExpanded ? "flex-start" : "center",
                  transition: "transform 0.3s ease",
                  transform: isChipsExpanded ? "rotate(180deg)" : "none",
                  "&:hover": {
                    color: darkMode ? "#c6ff00" : "#1976d2",
                    bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                  }
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* List panel */}
          <List className="custom-scrollbar" sx={{ flexGrow: 1, overflowY: "auto", py: 0 }}>
            {filteredConversations.slice(0, visibleCount).map((item) => {
              const isSelected = selectedChatId === item.conversationId;
              const hasUnread = item.metadata?.unreadCount > 0;
              return (
                <ListItemButton
                  key={item.conversationId}
                  selected={isSelected}
                  onClick={() => {
                    setSelectedChatId(item.conversationId);
                    if (isMobile) {
                      setMobileStep("chat");
                    }
                  }}
                  sx={{
                    py: 2,
                    px: 2.5,
                    borderBottom: `1px solid ${borderColor}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    transition: "all 0.2s ease",
                    position: "relative",
                    "&.Mui-selected": { 
                      bgcolor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      borderLeft: `3px solid ${darkMode ? "#c6ff00" : "#1976d2"}`
                    },
                    "&:hover": {
                      bgcolor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"
                    }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" width="100%" sx={{ mb: 0.5 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {/* Pulsing Active indicator */}
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: "50%", 
                          bgcolor: item.isHumanTakeoverActive ? "#ef4444" : "#44b700",
                          animation: "activePulse 1.8s infinite ease-in-out"
                        }} 
                      />
                      <Typography variant="subtitle2" fontWeight={800} sx={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: 170 }}>
                        {item.userProfile?.name || item.userProfile?.email || "Anonymous Guest"}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {new Date(item.metadata?.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "100%", mb: 1, textAlign: "left" }}>
                    {item.metadata?.lastMessageText || "(No message yet)"}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                    <Box display="flex" gap={0.5}>
                      <Chip 
                        label={item.status} 
                        size="small" 
                        color={item.status === "Escalated" ? "error" : item.status === "Resolved" ? "success" : "primary"} 
                        sx={{ height: 18, fontSize: "0.6rem", fontWeight: 800, borderRadius: "4px" }} 
                      />
                      {item.isHumanTakeoverActive && (
                        <Chip 
                          icon={<TakeoverIcon sx={{ "&&": { fontSize: 10, color: "#44b700" } }} />} 
                          label="Live Control" 
                          size="small" 
                          variant="outlined" 
                          sx={{ height: 18, fontSize: "0.6rem", color: "#44b700", borderColor: "#44b700", fontWeight: 800, borderRadius: "4px" }} 
                        />
                      )}
                    </Box>
                    {hasUnread && (
                      <Badge 
                        badgeContent={item.metadata.unreadCount} 
                        color="success" 
                        sx={{ 
                          "& .MuiBadge-badge": { 
                            fontSize: "0.7rem", 
                            fontWeight: 800,
                            minWidth: 16,
                            height: 16,
                            borderRadius: "50%",
                            bgcolor: darkMode ? "#c6ff00" : "#2e7d32",
                            color: "#000"
                          } 
                        }} 
                      />
                    )}
                  </Box>
                </ListItemButton>
              );
            })}

            {/* Progressive Infinite scroll loading trigger */}
            {filteredConversations.length > visibleCount && (
              <Box sx={{ py: 2, px: 2.5, textAlign: "center" }}>
                {isInfiniteLoading ? (
                  <CircularProgress size={16} sx={{ color: darkMode ? "#c6ff00" : "primary.main" }} />
                ) : (
                  <Button 
                    onClick={handleLoadMore} 
                    size="small" 
                    sx={{ 
                      textTransform: "none", 
                      fontSize: "0.75rem", 
                      fontWeight: 800, 
                      color: darkMode ? "#c6ff00" : "primary.main",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } 
                    }}
                  >
                    Load Older Conversations
                  </Button>
                )}
              </Box>
            )}

            {filteredConversations.length === 0 && (
              <Box sx={{ py: 8, px: 2, color: "text.secondary" }}>
                No active conversations matched this view.
              </Box>
            )}
          </List>
        </Box>
      )}



      {/* ================================================================= */}
      {/* 2. CENTER PANEL: CHAT TIMELINE (HIDDEN ON MOBILE IF LIST ACTIVE) */}
      {/* ================================================================= */}
      {(!isMobile || mobileStep === "chat") && (
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "100%", zIndex: 2, overflow: "hidden" }}>
          {chatDetails ? (
            <>
              {/* Header toolbar details */}
              <Box 
                sx={{ 
                  p: { xs: 1.25, sm: 2.5 }, 
                  borderBottom: `1px solid ${borderColor}`, 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  bgcolor: darkMode ? "rgba(10, 15, 26, 0.45)" : "#ffffff", 
                  backdropFilter: "blur(12px)" 
                }}
              >
                <Box display="flex" alignItems="center" gap={1.75}>
                  {isMobile && (
                    <IconButton onClick={() => setMobileStep("list")} sx={{ p: 0.5, mr: 0.5 }}>
                      <BackIcon />
                    </IconButton>
                  )}
                  <Avatar 
                    onClick={() => {
                      setShowRightPanel(true);
                      if (isMobile) setMobileStep("info");
                    }}
                    sx={{ 
                      bgcolor: darkMode ? "rgba(198,255,0,0.15)" : "rgba(25,118,210,0.1)", 
                      color: darkMode ? "#c6ff00" : "#1976d2", 
                      fontWeight: 800,
                      cursor: "pointer",
                      "&:hover": { transform: "scale(1.05)" },
                      transition: "transform 0.2s"
                    }}
                  >
                    {chatDetails.conversation?.userProfile?.name?.charAt(0) || "U"}
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={800} 
                      align="left" 
                      onClick={() => {
                        setShowRightPanel(true);
                        if (isMobile) setMobileStep("info");
                      }}
                      sx={{ 
                        cursor: "pointer", 
                        "&:hover": { color: darkMode ? "#c6ff00" : "#1976d2" },
                        fontSize: { xs: "0.85rem", sm: "1rem" },
                        lineHeight: 1.2
                      }}
                    >
                      {chatDetails.conversation?.userProfile?.name || "Anonymous Guest"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" align="left" display="block" sx={{ fontSize: { xs: "0.6rem", sm: "0.75rem" } }}>
                      Session ID: {isMobile ? chatDetails.conversation?.conversationId?.substring(0, 8) + "..." : chatDetails.conversation?.conversationId}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={{ xs: 0.5, sm: 1.25 }} alignItems="center">
                  {/* Resolve/Reopen button */}
                  {chatDetails.conversation?.status === "Resolved" ? (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleUpdateStatus("Open")}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2.5,
                        bgcolor: "#10b981",
                        color: "white",
                        fontWeight: 800,
                        fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        px: { xs: 1, sm: 2 },
                        py: { xs: 0.5, sm: 0.75 },
                        minWidth: "auto",
                        "&:hover": { bgcolor: "#059669" }
                      }}
                    >
                      {isMobile ? "Reopen" : "Reopen Ticket"}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleUpdateStatus("Resolved")}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2.5,
                        bgcolor: "#3b82f6",
                        color: "white",
                        fontWeight: 800,
                        fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        px: { xs: 1, sm: 2 },
                        py: { xs: 0.5, sm: 0.75 },
                        minWidth: "auto",
                        "&:hover": { bgcolor: "#2563eb" }
                      }}
                    >
                      {isMobile ? "Resolve" : "Resolve Ticket"}
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={isMobile ? null : <TakeoverIcon />}
                    onClick={() => handleToggleTakeover(!chatDetails.conversation?.isHumanTakeoverActive)}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2.5,
                      borderColor: chatDetails.conversation?.isHumanTakeoverActive ? "#ef4444" : (darkMode ? "#c6ff00" : "#1976d2"),
                      color: chatDetails.conversation?.isHumanTakeoverActive ? "#ef4444" : (darkMode ? "#c6ff00" : "#1976d2"),
                      fontWeight: 800,
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                      px: { xs: 1, sm: 2 },
                      py: { xs: 0.5, sm: 0.75 },
                      minWidth: "auto",
                      "&:hover": {
                        bgcolor: chatDetails.conversation?.isHumanTakeoverActive ? "rgba(239, 68, 68, 0.05)" : "transparent"
                      }
                    }}
                  >
                    {isMobile 
                      ? (chatDetails.conversation?.isHumanTakeoverActive ? "Release" : "Takeover") 
                      : (chatDetails.conversation?.isHumanTakeoverActive ? "Release Takeover" : "Take Over Live")
                    }
                  </Button>
                  <Tooltip title="View Client Information">
                    <IconButton 
                      onClick={() => {
                        setShowRightPanel(prev => !prev);
                        if (isMobile) setMobileStep("info");
                      }} 
                      sx={{ 
                        color: showRightPanel ? (darkMode ? "#c6ff00" : "#1976d2") : "text.secondary",
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      <InfoIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Selector Tabs (Chat Timeline vs Team internal private notes) */}
              <Box display="flex" sx={{ borderBottom: `1px solid ${borderColor}`, bgcolor: darkMode ? "rgba(10, 15, 26, 0.2)" : "#ffffff" }}>
                <Button 
                  onClick={() => setActiveTab("chat")} 
                  sx={{ 
                    flex: 1, 
                    borderRadius: 0, 
                    borderBottom: activeTab === "chat" ? `2px solid ${darkMode ? "#c6ff00" : "#1976d2"}` : "none", 
                    color: activeTab === "chat" ? (darkMode ? "#c6ff00" : "#1976d2") : "text.secondary", 
                    py: { xs: 1, sm: 1.5 },
                    fontWeight: 700,
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    textTransform: "none"
                  }}
                >
                  Chat History
                </Button>
                <Button 
                  onClick={() => setActiveTab("notes")} 
                  sx={{ 
                    flex: 1, 
                    borderRadius: 0, 
                    borderBottom: activeTab === "notes" ? `2px solid ${darkMode ? "#c6ff00" : "#1976d2"}` : "none", 
                    color: activeTab === "notes" ? (darkMode ? "#c6ff00" : "#1976d2") : "text.secondary", 
                    py: { xs: 1, sm: 1.5 },
                    fontWeight: 700,
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    textTransform: "none"
                  }}
                >
                  Private Notes ({chatDetails.notes?.length || 0})
                </Button>
              </Box>

              {/* Chat Viewport Area */}
              <Box sx={{ flexGrow: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <Box
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="custom-scrollbar"
                  sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, sm: 3 },
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 1.5, sm: 2.5 },
                    bgcolor: darkMode ? "#080c14" : "#fafafa",
                    height: "100%"
                  }}
                >
                  {activeTab === "chat" ? (
                  <>
                    {chatDetails.messages?.map((msg, idx) => {
                      const isAdminMsg = msg.sender.role === "admin";
                      const isModelMsg = msg.sender.role === "model";
                      return (
                        <Box 
                          key={idx} 
                          sx={{ 
                            display: "flex", 
                            justifyContent: isAdminMsg ? "flex-end" : "flex-start", 
                            width: "100%" 
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: { xs: "85%", sm: "70%" },
                              p: { xs: 1.25, sm: 2 },
                              borderRadius: 3.5,
                              boxShadow: "0 1.5px 3px rgba(0,0,0,0.06)",
                              ...(isAdminMsg
                                ? { 
                                  bgcolor: darkMode ? "#0288d1" : "#e0f7fa", 
                                  color: darkMode ? "#ffffff" : "#01579b", 
                                  border: `1px solid ${darkMode ? "#01579b" : "#b2ebf2"}`,
                                  borderBottomRightRadius: 0 
                                }
                                : isModelMsg
                                ? { 
                                  bgcolor: darkMode ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.03)", 
                                  color: textColor, 
                                  borderBottomLeftRadius: 0, 
                                  border: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.3)" : borderColor}` 
                                }
                                : { 
                                  bgcolor: darkMode ? "rgba(198,255,0,0.06)" : "rgba(25, 118, 210, 0.03)", 
                                  color: textColor, 
                                  borderBottomLeftRadius: 0, 
                                  border: `1px solid ${darkMode ? "rgba(198,255,0,0.2)" : borderColor}` 
                                })
                            }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 0.5, 
                                mb: 0.75, 
                                opacity: 0.85, 
                                fontWeight: 800, 
                                fontSize: "0.65rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                color: isModelMsg ? "#818cf8" : (isAdminMsg ? "inherit" : "inherit")
                              }}
                            >
                              {isAdminMsg ? "👨‍💼 Support Agent (Human)" : isModelMsg ? "🤖 AI Assistant (Gemini)" : "👤 Client User"}
                            </Typography>
                            
                            {/* Formatted Markdown Body */}
                            <Box sx={{ "& p": { m: 0 } }}>
                              {formatMessageText(msg.text)}
                            </Box>

                            {/* Attachments Preview Module */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <Box display="flex" flexDirection="column" gap={1.25} sx={{ mt: 1.5 }}>
                                {msg.attachments.map((attach, aIdx) => {
                                  const resolvedUrl = resolveMediaUrl(attach.fileUrl);
                                  if (attach.fileType === "photo") {
                                    return (
                                      <Box 
                                        key={aIdx} 
                                        component="img" 
                                        src={resolvedUrl} 
                                        alt={attach.fileName || "Uploaded image"}
                                        sx={{ 
                                          maxWidth: "100%", 
                                          maxHeight: 220, 
                                          borderRadius: 2, 
                                          objectFit: "cover", 
                                          cursor: "pointer",
                                          border: `1px solid ${borderColor}`,
                                          transition: "transform 0.2s",
                                          "&:hover": { transform: "scale(1.02)" }
                                        }}
                                        onClick={() => window.open(resolvedUrl, "_blank")}
                                      />
                                    );
                                  }
                                  if (attach.fileType === "video") {
                                    return (
                                      <Box 
                                        key={aIdx} 
                                        component="video" 
                                        src={resolvedUrl} 
                                        controls 
                                        sx={{ 
                                          maxWidth: "100%", 
                                          maxHeight: 220, 
                                          borderRadius: 2, 
                                          border: `1px solid ${borderColor}` 
                                        }}
                                      />
                                    );
                                  }
                                  // PDF Preview Card
                                  return (
                                    <Paper 
                                      key={aIdx}
                                      variant="outlined" 
                                      onClick={() => window.open(resolvedUrl, "_blank")}
                                      sx={{ 
                                        p: 1.5, 
                                        display: "flex", 
                                        alignItems: "center", 
                                        gap: 1.5, 
                                        borderRadius: 2.25, 
                                        cursor: "pointer",
                                        bgcolor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                                        borderColor,
                                        "&:hover": { bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }
                                      }}
                                    >
                                      <Typography fontSize={24}>📄</Typography>
                                      <Box sx={{ overflow: "hidden", textAlign: "left" }}>
                                        <Typography variant="body2" fontWeight={750} noWrap sx={{ maxWidth: 180 }}>
                                          {attach.fileName || "document.pdf"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          PDF Document {attach.fileSizeBytes ? `• ${(attach.fileSizeBytes / 1024).toFixed(1)} KB` : ""}
                                        </Typography>
                                      </Box>
                                    </Paper>
                                  );
                                })}
                              </Box>
                            )}

                            <Typography variant="caption" sx={{ display: "block", textAlign: "right", mt: 0.75, opacity: 0.5, fontSize: "0.6rem" }}>
                              {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}

                    {/* Simulated user typing indicator if takeover is active */}
                    {chatDetails.conversation?.isHumanTakeoverActive && (
                      <Box display="flex" alignItems="center" gap={1} sx={{ opacity: 0.7, ml: 1, my: 1 }}>
                        <Typography variant="caption" sx={{ fontStyle: "italic", fontSize: "0.75rem" }}>
                          Live monitoring active
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#44b700", animation: "activePulse 1.2s infinite ease-in-out" }} />
                          <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#44b700", animation: "activePulse 1.2s infinite ease-in-out", animationDelay: "0.2s" }} />
                          <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#44b700", animation: "activePulse 1.2s infinite ease-in-out", animationDelay: "0.4s" }} />
                        </Box>
                      </Box>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  /* Team Notes Panel Viewport */
                  <>
                    <Box display="flex" gap={1.5} sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Add private annotative note only visible to team admins..."
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: cardColor } }}
                      />
                      <Button 
                        variant="contained" 
                        onClick={handleSubmitNote} 
                        startIcon={<NoteIcon />} 
                        sx={{ 
                          textTransform: "none", 
                          borderRadius: 3, 
                          px: 3,
                          bgcolor: darkMode ? "#c6ff00" : "#1976d2",
                          color: darkMode ? "#000" : "#fff",
                          fontWeight: 700,
                          "&:hover": { opacity: 0.9 }
                        }}
                      >
                        Annotate
                      </Button>
                    </Box>
                    <List sx={{ display: "flex", flexDirection: "column", gap: 2, p: 0 }}>
                      {chatDetails.notes?.map((note, idx) => (
                        <Paper 
                          key={idx} 
                          variant="outlined" 
                          sx={{ 
                            p: 2.5, 
                            borderRadius: 3.5, 
                            borderColor, 
                            bgcolor: darkMode ? "rgba(255,255,255,0.01)" : "#ffffff" 
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={800}>
                              ✏️ {note.authorName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(note.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" align="left" sx={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                            {note.text}
                          </Typography>
                        </Paper>
                      ))}
                    </List>
                  </>
                )}
                </Box>
                {activeTab === "chat" && showScrollArrow && (
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

              {/* Center Panel Bottom Input Box (Sticky / Floating) */}
              {activeTab === "chat" && (
                <Box 
                  sx={{ 
                    p: { xs: 1, sm: 2 }, 
                    borderTop: `1px solid ${borderColor}`, 
                    bgcolor: darkMode ? "rgba(10, 15, 26, 0.6)" : "#ffffff", 
                    backdropFilter: "blur(20px)" 
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder={isMobile 
                      ? (chatDetails.conversation?.isHumanTakeoverActive ? "Type reply..." : "Take over to reply...") 
                      : (chatDetails.conversation?.isHumanTakeoverActive ? "Type takeover message reply here..." : "Take over live support to message...")
                    }
                    disabled={!chatDetails.conversation?.isHumanTakeoverActive}
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendReply()}
                    InputProps={{
                      startAdornment: (
                        <Box display="flex" gap={0.5} sx={{ mr: 1, color: "text.secondary" }}>
                          <IconButton size="small" disabled={!chatDetails.conversation?.isHumanTakeoverActive}><EmojiIcon fontSize="small" /></IconButton>
                          <IconButton size="small" disabled={!chatDetails.conversation?.isHumanTakeoverActive}><AttachIcon fontSize="small" /></IconButton>
                        </Box>
                      ),
                      endAdornment: (
                        <IconButton 
                          onClick={handleSendReply} 
                          color="primary" 
                          disabled={!replyInput.trim() || !chatDetails.conversation?.isHumanTakeoverActive}
                          sx={{
                            color: darkMode ? "#c6ff00" : "#1976d2"
                          }}
                        >
                          <SendIcon />
                        </IconButton>
                      )
                    }}
                    sx={{ 
                      "& .MuiOutlinedInput-root": { 
                        borderRadius: 3.5,
                        bgcolor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
                      } 
                    }}
                  />
                  {!chatDetails.conversation?.isHumanTakeoverActive && (
                    <Typography 
                      variant="caption" 
                      onClick={() => handleToggleTakeover(true)}
                      sx={{ 
                        display: "block", 
                        mt: 1, 
                        color: darkMode ? "#c6ff00" : "#1976d2", 
                        fontWeight: 800, 
                        cursor: "pointer", 
                        textAlign: "left",
                        fontSize: { xs: "0.68rem", sm: "0.75rem" },
                        "&:hover": { textDecoration: "underline" } 
                      }}
                    >
                      {isMobile 
                        ? "👨‍💼 Monitor mode. Click here to take over and reply." 
                        : "👨‍💼 You are currently in monitor-only mode. Click here or \"Take Over Live\" above to intervene and reply."
                      }
                    </Typography>
                  )}
                </Box>
              )}
            </>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography color="text.secondary">No conversation selected.</Typography>
            </Box>
          )}
        </Box>
      )}



      {/* ================================================================= */}
      {/* 3. RIGHT PANEL: RICH CRM CLIENT SIDEBAR (DRAWER/SLIDE IN) */}
      {/* ================================================================= */}
      {chatDetails && chatDetails.conversation && (
        <Box 
          sx={{ 
            // fixed width on desktop docked mode, full drawer overlays on tablet/mobile
            width: isMobile ? "100%" : (isTablet ? 320 : `${showRightPanel ? 340 : 0}px`), 
            minWidth: showRightPanel && !isTablet && !isMobile ? 340 : 0,
            borderLeft: showRightPanel && !isTablet && !isMobile ? `1px solid ${borderColor}` : "none", 
            overflowY: "auto", 
            overflowX: "hidden", // Prevent horizontal overflow during layout slide
            display: "flex", 
            flexDirection: "column", 
            bgcolor: darkMode ? "rgba(10, 15, 26, 0.85)" : "#ffffff", 
            backdropFilter: "blur(20px)",
            height: "100%",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 4,
            
            // Slide-over logic for mobile/tablet drawer mode
            ...((isTablet || isMobile) && {
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              transform: showRightPanel ? "translateX(0)" : "translateX(100%)",
              boxShadow: showRightPanel ? "-4px 0 20px rgba(0,0,0,0.3)" : "none",
              width: isMobile ? "100%" : 320,
            })
          }}
          className="custom-scrollbar"
        >
          {/* Inner content stable wrapper to prevent text breaking during slide transition */}
          <Box sx={{ width: isMobile ? "100%" : (isTablet ? 320 : 340), p: 3, display: "flex", flexDirection: "column", gap: 3.5, boxSizing: "border-box" }}>
            {showRightPanel && (
              <>
                {/* Close Button Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={850} color="text.secondary">
                    CLIENT PROFILE
                  </Typography>
                  <IconButton 
                    onClick={() => {
                      setShowRightPanel(false);
                      if (isMobile) setMobileStep("chat");
                    }} 
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* User CRM Identity */}
                <Box display="flex" flexDirection="column" alignItems="center" sx={{ pb: 3, borderBottom: `1px solid ${borderColor}` }}>
                  <Avatar sx={{ width: 68, height: 68, bgcolor: darkMode ? "rgba(198,255,0,0.15)" : "rgba(25,118,210,0.1)", color: darkMode ? "#c6ff00" : "#1976d2", fontSize: 28, fontWeight: 800, mb: 1.5 }}>
                    {chatDetails.conversation.userProfile?.name?.charAt(0) || "U"}
                  </Avatar>
                  <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
                    {chatDetails.conversation.userProfile?.name || "Anonymous Guest"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {chatDetails.conversation.userProfile?.email}
                  </Typography>
                  {chatDetails.conversation.userProfile?.phone && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                      📞 {chatDetails.conversation.userProfile.phone}
                    </Typography>
                  )}
                  
                  {/* Horizontal Plan & Sentiment Tags */}
                  <Box display="flex" gap={0.75} sx={{ mt: 2 }}>
                    <Chip 
                      label={chatDetails.conversation.userProfile?.subscriptionPlan || "Free"} 
                      color="secondary" 
                      size="small" 
                      sx={{ fontWeight: 800, fontSize: "0.65rem", borderRadius: "4px" }} 
                    />
                    <Chip 
                      label={`Sentiment: ${chatDetails.conversation?.overallSentiment || "Neutral"}`} 
                      size="small" 
                      variant="outlined" 
                      sx={{ 
                        fontWeight: 800, 
                        fontSize: "0.65rem", 
                        borderRadius: "4px",
                        color: chatDetails.conversation?.overallSentiment === "Frustrated" || chatDetails.conversation?.overallSentiment === "Angry" ? "#ef4444" : (chatDetails.conversation?.overallSentiment === "Confused" ? "#f59e0b" : (chatDetails.conversation?.overallSentiment === "Interested" || chatDetails.conversation?.overallSentiment === "Happy" ? "#10b981" : textColor)),
                        borderColor: chatDetails.conversation?.overallSentiment === "Frustrated" || chatDetails.conversation?.overallSentiment === "Angry" ? "#ef4444" : (chatDetails.conversation?.overallSentiment === "Confused" ? "#f59e0b" : (chatDetails.conversation?.overallSentiment === "Interested" || chatDetails.conversation?.overallSentiment === "Happy" ? "#10b981" : borderColor))
                      }} 
                    />
                  </Box>
                </Box>

                {/* Lead Score Indicator Progress Bar */}
                <Box sx={{ textAlign: "left" }}>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={800}>
                      LEAD CONVERSION SCORE
                    </Typography>
                    <Typography variant="caption" fontWeight={800} color={darkMode ? "#c6ff00" : "primary"}>
                      {chatDetails.conversation.leadScore || 0} / 100
                    </Typography>
                  </Box>
                  <Box sx={{ width: "100%", height: 6, bgcolor: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: 10, overflow: "hidden" }}>
                    <Box 
                      sx={{ 
                        width: `${chatDetails.conversation.leadScore || 0}%`, 
                        height: "100%", 
                        bgcolor: (chatDetails.conversation.leadScore || 0) > 65 ? "#10b981" : ((chatDetails.conversation.leadScore || 0) > 35 ? "#f59e0b" : "#ef4444"),
                        borderRadius: 10,
                        transition: "width 0.5s ease"
                      }} 
                    />
                  </Box>
                </Box>

                {/* AI Intelligence Summary Panel */}
                {chatDetails.summary ? (
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4, borderColor, bgcolor: darkMode ? "rgba(255,255,255,0.01)" : "#ffffff", textAlign: "left" }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                      <AILeadIcon sx={{ color: darkMode ? "#c6ff00" : "#1976d2", fontSize: 18 }} />
                      <Typography variant="subtitle2" fontWeight={800}>
                        AI Support Intelligence
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1.5, fontSize: "0.8rem", lineHeight: 1.4 }}>
                      <strong>Summary:</strong> {chatDetails.summary.summaryText}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5, fontSize: "0.8rem", lineHeight: 1.4 }}>
                      <strong>Core Roadblock:</strong> {chatDetails.summary.detectedIssue}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5, fontSize: "0.8rem", lineHeight: 1.4 }}>
                      <strong>Suggested Agent Action:</strong> {chatDetails.summary.suggestedAction}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
                      <Chip label={`Risk: ${chatDetails.summary.escalationRisk}`} size="small" color={chatDetails.summary.escalationRisk === "High" ? "error" : "default"} sx={{ fontSize: "0.6rem", fontWeight: 800, height: 18, borderRadius: "4px" }} />
                      <Chip label={`Potential: ${(chatDetails.conversation.leadScore || 0) > 65 ? "High" : "Standard"}`} size="small" color={(chatDetails.conversation.leadScore || 0) > 65 ? "success" : "default"} sx={{ fontSize: "0.6rem", fontWeight: 800, height: 18, borderRadius: "4px" }} />
                    </Box>
                  </Paper>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    AI generating intelligence summaries...
                  </Typography>
                )}

                {/* Device & Location Meta information */}
                <Box sx={{ textAlign: "left" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={800} display="block" sx={{ mb: 1.5, letterSpacing: 0.5 }}>
                    HARDWARE & GEOGRAPHY
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">COUNTRY</Typography>
                      <Typography variant="body2" fontWeight={700}>{chatDetails.conversation.userProfile?.geo?.country || "United States"}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">OS</Typography>
                      <Typography variant="body2" fontWeight={700}>{chatDetails.conversation.userProfile?.system?.os || "Windows 11"}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" display="block">BROWSER / CLIENT</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {chatDetails.conversation.userProfile?.system?.browser || "Chrome 124"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Vertical Dynamic Event Timeline */}
                <Box sx={{ textAlign: "left", pt: 1, borderTop: `1px solid ${borderColor}` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={850} display="block" sx={{ mb: 2.5, letterSpacing: 0.5 }}>
                    ACTIVITY HISTORY TIMELINE
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", position: "relative", pl: 2, borderLeft: `1px dashed ${borderColor}`, ml: 1, gap: 2.75 }}>
                    
                    {/* Event Node 1: Session Start */}
                    <Box sx={{ position: "relative" }}>
                      <Box sx={{ position: "absolute", left: "-21px", top: "4px", width: "9px", height: "9px", borderRadius: "50%", bgcolor: "#10b981", border: `2px solid ${darkMode ? "#070a0f" : "#ffffff"}` }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", fontWeight: 700 }}>
                        {new Date(chatDetails.conversation?.metadata?.lastMessageAt || Date.now()).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ fontSize: "0.78rem" }}>
                        Live CRM Session Started
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", display: "block", mt: 0.25 }}>
                        Client active from {chatDetails.conversation?.userProfile?.geo?.country || "USA"} using {chatDetails.conversation?.userProfile?.system?.os || "Desktop OS"}
                      </Typography>
                    </Box>

                    {/* Event Node 2: AI Assistance */}
                    <Box sx={{ position: "relative" }}>
                      <Box sx={{ position: "absolute", left: "-21px", top: "4px", width: "9px", height: "9px", borderRadius: "50%", bgcolor: "#6366f1", border: `2px solid ${darkMode ? "#070a0f" : "#ffffff"}` }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", fontWeight: 700 }}>
                        {new Date(chatDetails.conversation?.metadata?.lastMessageAt || Date.now()).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ fontSize: "0.78rem" }}>
                        AI Standby Matching Active
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", display: "block", mt: 0.25 }}>
                        Gemini LLM semantic analyzer listening. Calculated sentiment: {chatDetails.conversation?.overallSentiment || "Neutral"}.
                      </Typography>
                    </Box>

                    {/* Event Node 3: Ticket Escalated if applicable */}
                    {chatDetails.conversation?.status === "Escalated" && (
                      <Box sx={{ position: "relative" }}>
                        <Box sx={{ position: "absolute", left: "-21px", top: "4px", width: "9px", height: "9px", borderRadius: "50%", bgcolor: "#ef4444", border: `2px solid ${darkMode ? "#070a0f" : "#ffffff"}` }} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", fontWeight: 700 }}>
                          High Priority Event
                        </Typography>
                        <Typography variant="body2" fontWeight={800} sx={{ fontSize: "0.78rem", color: "#ef4444" }}>
                          Conversation Escalated
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", display: "block", mt: 0.25 }}>
                          High priority escalation status triggered. Lead score evaluated at {chatDetails.conversation?.leadScore || 0}.
                        </Typography>
                      </Box>
                    )}

                    {/* Event Node 4: Takeover if active */}
                    {chatDetails.conversation?.isHumanTakeoverActive && (
                      <Box sx={{ position: "relative" }}>
                        <Box sx={{ position: "absolute", left: "-21px", top: "4px", width: "9px", height: "9px", borderRadius: "50%", bgcolor: "#44b700", border: `2px solid ${darkMode ? "#070a0f" : "#ffffff"}`, animation: "activePulse 1.4s infinite ease-in-out" }} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", fontWeight: 700 }}>
                          Live Intervened
                        </Typography>
                        <Typography variant="body2" fontWeight={800} sx={{ fontSize: "0.78rem", color: "#44b700" }}>
                          Human Admin takeover active
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", display: "block", mt: 0.25 }}>
                          Live chat control assigned to admin. AI automation paused.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}
      
    </Box>
  );
}
