import express from "express";
import {
  getDashboardKpis,
  getTrends,
  getTopFlows,
  getDropoffs,
  getConfusion,
  getRecommendations,
  triggerFaqMining,
  getConversations,
  getConversationById,
  createAdminNote,
  updateConversationStatus,
  createAdminReply
} from "../controllers/analyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import ChatSession from "../models/ChatSession.js";
import UserProfile from "../models/UserProfile.js";
import Conversation from "../models/Conversation.js";
import ConversationMessage from "../models/ConversationMessage.js";
import ChatbotFlow from "../models/ChatbotFlow.js";

const router = express.Router();

/**
 * @route   POST /api/analytics/events
 * @desc    Ingest a batch of user widget interactions
 * @access  Protected (Authenticated via Widget User Token)
 */
router.post("/events", authMiddleware, async (req, res) => {
  const { sessionId, events } = req.body;
  
  if (!sessionId || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ success: false, error: "Invalid tracking payload structure." });
  }

  try {
    const formattedEvents = events.map((event) => ({
      sessionId,
      userId: req.user?._id || req.user?.id || null,
      eventType: event.eventType,
      payload: event.payload || {},
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    }));

    // Step 1: Ingest events via fast bulk inserts
    await AnalyticsEvent.insertMany(formattedEvents, { ordered: false });

    // Step 2: Dynamically increment session counters
    const queryCounts = events.filter((e) => e.eventType === "AI_QUERY").length;
    const clickCounts = events.filter((e) => e.eventType === "PREDEFINED_CLICK").length;
    const fallbackCounts = events.filter((e) => e.eventType === "FALLBACK_TRIGGERED").length;
    const fileCounts = events.filter((e) =>
      ["FILE_VIEW", "PDF_OPEN", "VIDEO_PLAY"].includes(e.eventType)
    ).length;

    await ChatSession.findOneAndUpdate(
      { sessionId },
      {
        $inc: {
          "metrics.totalAiQueries": queryCounts,
          "metrics.totalPredefinedClicks": clickCounts,
          "metrics.totalFallbacks": fallbackCounts,
          "metrics.totalFileViews": fileCounts,
        },
        $set: { 
          "user.userId": req.user?._id || req.user?.id || null,
          "user.email": req.user?.email || "",
          lastActiveAt: new Date() 
        },
      },
      { upsert: true, new: true }
    );

    // Step 3: Fast automated sync to CRM databases
    if (req.user && req.user.email) {
      let profile = await UserProfile.findOne({ email: req.user.email });
      if (!profile) {
        profile = await UserProfile.create({
          userId: req.user._id || req.user.id || null,
          email: req.user.email,
          name: req.user.name || "Anonymous Guest",
          phone: req.user.phone || "",
          subscriptionPlan: req.user.subscriptionPlan || "Free",
          geo: { country: "India" },
          system: { browser: "Chrome", os: "Windows", deviceType: "Desktop" },
          metrics: { sessionCount: 1, totalAiQueries: queryCounts, totalPredefinedClicks: clickCounts }
        });
      } else {
        profile.phone = req.user.phone || profile.phone || "";
        profile.metrics.sessionCount += 1;
        profile.metrics.totalAiQueries += queryCounts;
        profile.metrics.totalPredefinedClicks += clickCounts;
        profile.metrics.lastActiveAt = new Date();
        await profile.save();
      }

      let conversation = await Conversation.findOne({ conversationId: sessionId });
      const hasInteraction = events.some((e) => ["AI_QUERY", "PREDEFINED_CLICK"].includes(e.eventType));

      if (!conversation && hasInteraction) {
        conversation = await Conversation.create({
          conversationId: sessionId,
          userProfile: profile._id,
          status: "Open",
          isHumanTakeoverActive: false,
          metadata: {
            tags: ["live_chat"],
            unreadCount: 0,
            lastMessageText: "Session initialized by user",
            lastMessageAt: new Date()
          }
        });
      }

      if (conversation) {
        // Sync individual messages (PREDEFINED_CLICK only, since AI_QUERY is synced synchronously in chatbotController.js)
        for (const e of events) {
          if (e.eventType === "PREDEFINED_CLICK" && e.payload?.flowId) {
            const flow = await ChatbotFlow.findOne({ id: e.payload.flowId });
            if (flow) {
              await ConversationMessage.create({
                conversationId: sessionId,
                sender: { role: "user" },
                text: flow.question,
                timestamp: e.timestamp ? new Date(e.timestamp) : new Date()
              });

              await ConversationMessage.create({
                conversationId: sessionId,
                sender: { role: "model" },
                text: flow.answer,
                timestamp: e.timestamp ? new Date(e.timestamp) : new Date()
              });

              conversation.metadata.lastMessageText = flow.answer;
              conversation.metadata.lastMessageAt = e.timestamp ? new Date(e.timestamp) : new Date();
            }
          }
        }
        await conversation.save();
      }
    }

    return res.status(202).json({ success: true, message: "Batch events ingested successfully." });
  } catch (error) {
    console.error("[Analytics Ingestion Route Error]:", error);
    return res.status(500).json({ success: false, error: "Server error during event ingestion." });
  }
});

// Admin-Protected Live Aggregations
router.get("/dashboard", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), getDashboardKpis);
router.get("/trends", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), getTrends);
router.get("/top-flows", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), getTopFlows);
router.get("/dropoff", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), getDropoffs);
router.get("/confusion", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), getConfusion);
router.get("/recommendations", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), getRecommendations);

// Trigger dynamic LLM FAQ categorization pipeline
router.post("/mine-faqs", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), triggerFaqMining);

// Chatbot Support CRM Routes
router.get("/conversations", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), getConversations);
router.get("/conversations/:id", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), getConversationById);
router.post("/conversations/note", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), createAdminNote);
router.post("/conversations/status", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), updateConversationStatus);
router.post("/conversations/reply", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), createAdminReply);

export default router;
