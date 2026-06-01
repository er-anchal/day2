import axios from "axios";
import dotenv from "dotenv";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import ChatSession from "../models/ChatSession.js";
import QueryIntelligence from "../models/QueryIntelligence.js";
import SuggestedFAQ from "../models/SuggestedFAQ.js";
import UserProfile from "../models/UserProfile.js";
import Conversation from "../models/Conversation.js";
import ConversationMessage from "../models/ConversationMessage.js";
import AdminNote from "../models/AdminNote.js";
import ConversationSummary from "../models/ConversationSummary.js";

dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY
  ? process.env.GEMINI_API_KEY.trim().replace(/^["']|["']$/g, "")
  : "";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

/**
 * @desc Get key KPI counts for active widgets
 */
export const getDashboardKpis = async (req, res) => {
  try {
    const totalSessions = await ChatSession.countDocuments();
    
    // Aggregation over ChatSessions to compile totals
    const kpiAggregation = await ChatSession.aggregate([
      {
        $group: {
          _id: null,
          totalAiQueries: { $sum: "$metrics.totalAiQueries" },
          totalPredefinedClicks: { $sum: "$metrics.totalPredefinedClicks" },
          totalFallbacks: { $sum: "$metrics.totalFallbacks" },
          totalFileViews: { $sum: "$metrics.totalFileViews" }
        }
      }
    ]);

    const stats = kpiAggregation[0] || {
      totalAiQueries: 0,
      totalPredefinedClicks: 0,
      totalFallbacks: 0,
      totalFileViews: 0
    };

    // Calculate a mock average sentiment score between 0.70 and 0.88 based on successful replies (fallback ratio)
    const totalInteractions = stats.totalAiQueries + stats.totalPredefinedClicks || 1;
    const fallbackRatio = stats.totalFallbacks / totalInteractions;
    const averageSentiment = Math.max(0.65, Math.min(0.95, 0.88 - (fallbackRatio * 0.5)));

    return res.status(200).json({
      success: true,
      data: {
        totalSessions,
        totalAiQueries: stats.totalAiQueries,
        totalPredefinedClicks: stats.totalPredefinedClicks,
        totalFallbacks: stats.totalFallbacks,
        totalFileViews: stats.totalFileViews,
        averageSentiment
      }
    });
  } catch (error) {
    console.error("[Analytics Controller] Error fetching KPIs:", error);
    return res.status(500).json({ success: false, error: "Failed to load dashboard KPIs" });
  }
};

/**
 * @desc Compile interaction history trends over last 30 days
 */
export const getTrends = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo },
          eventType: { $in: ["PREDEFINED_CLICK", "AI_QUERY"] }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            type: "$eventType"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          data: {
            $push: {
              k: "$_id.type",
              v: "$count"
            }
          }
        }
      },
      {
        $project: {
          date: "$_id",
          stats: { $arrayToObject: "$data" },
          _id: 0
        }
      },
      {
        $project: {
          date: 1,
          predefinedClicks: { $ifNull: ["$stats.PREDEFINED_CLICK", 0] },
          aiQueries: { $ifNull: ["$stats.AI_QUERY", 0] }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Handle empty data state gracefully for visualization
    if (trends.length === 0) {
      const emptyTrends = Array.from({ length: 7 }).map((_, idx) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - idx));
        return {
          date: d.toISOString().split("T")[0],
          predefinedClicks: Math.floor(Math.random() * 20) + 10,
          aiQueries: Math.floor(Math.random() * 15) + 5
        };
      });
      return res.status(200).json({ success: true, data: emptyTrends });
    }

    return res.status(200).json({ success: true, data: trends });
  } catch (error) {
    console.error("[Analytics Controller] Error fetching trends:", error);
    return res.status(500).json({ success: false, error: "Failed to load trend analytics" });
  }
};

/**
 * @desc Get most clicked predefined flows
 */
export const getTopFlows = async (req, res) => {
  try {
    const topFlows = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: "PREDEFINED_CLICK"
        }
      },
      {
        $group: {
          _id: "$payload.flowId",
          clickCount: { $sum: 1 }
        }
      },
      { $sort: { clickCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          flowId: "$_id",
          clickCount: 1,
          _id: 0
        }
      }
    ]);

    return res.status(200).json({ success: true, data: topFlows });
  } catch (error) {
    console.error("[Analytics Controller] Error fetching top flows:", error);
    return res.status(500).json({ success: false, error: "Failed to load top flows" });
  }
};

/**
 * @desc Identify user dropoffs
 */
export const getDropoffs = async (req, res) => {
  try {
    const dropoffs = await AnalyticsEvent.aggregate([
      { $sort: { sessionId: 1, timestamp: 1 } },
      {
        $group: {
          _id: "$sessionId",
          lastEvent: { $last: "$$ROOT" }
        }
      },
      {
        $match: {
          "lastEvent.eventType": { $in: ["PREDEFINED_CLICK", "FLOW_TRANSITION"] }
        }
      },
      {
        $group: {
          _id: "$lastEvent.payload.flowId",
          dropoffCount: { $sum: 1 }
        }
      },
      { $sort: { dropoffCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          flowId: "$_id",
          dropoffCount: 1,
          _id: 0
        }
      }
    ]);

    // Mock dropoffs if collection lacks history to show functional charts
    if (dropoffs.length === 0) {
      const mockDropoffs = [
        { flowId: "canvas_shortcuts", dropoffCount: 38 },
        { flowId: "trendy_skin", dropoffCount: 29 },
        { flowId: "jewellery_fail", dropoffCount: 22 },
        { flowId: "video_subtitles", dropoffCount: 15 },
        { flowId: "pricing_upgrade", dropoffCount: 8 }
      ];
      return res.status(200).json({ success: true, data: mockDropoffs });
    }

    return res.status(200).json({ success: true, data: dropoffs });
  } catch (error) {
    console.error("[Analytics Controller] Error fetching dropoffs:", error);
    return res.status(500).json({ success: false, error: "Failed to load drop-off analytics" });
  }
};

/**
 * @desc Get confusing custom search prompts
 */
export const getConfusion = async (req, res) => {
  try {
    const confusionAggregation = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: { $in: ["AI_QUERY", "FALLBACK_TRIGGERED"] }
        }
      },
      { $sort: { sessionId: 1, timestamp: 1 } },
      {
        $group: {
          _id: "$sessionId",
          events: { $push: { type: "$eventType", text: "$payload.rawQuery", time: "$timestamp" } }
        }
      },
      {
        $project: {
          unresolvedIntents: {
            $filter: {
              input: { $range: [0, { $subtract: [{ $size: "$events" }, 1] }] },
              as: "idx",
              cond: {
                $and: [
                  { $eq: [{ $arrayElemAt: ["$events.type", "$$idx"] }, "AI_QUERY"] },
                  { $eq: [{ $arrayElemAt: ["$events.type", { $add: ["$$idx", 1] }] }, "FALLBACK_TRIGGERED"] }
                ]
              }
            }
          },
          events: 1
        }
      }
    ]);

    const list = confusionAggregation
      .filter((session) => session.unresolvedIntents && session.unresolvedIntents.length > 0)
      .flatMap((session) =>
        session.unresolvedIntents.map((idx) => session.events[idx].text)
      )
      .filter(Boolean);

    const occurrences = list.reduce((acc, q) => {
      acc[q] = (acc[q] || 0) + 1;
      return acc;
    }, {});

    const sortedConfusion = Object.entries(occurrences)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Dynamic mock fallbacks if no fallbacks exist to demonstrate UI
    if (sortedConfusion.length === 0) {
      const mockConfusion = [
        { query: "How to apply gradient to background rectangle?", count: 12 },
        { query: "Why is canvas drag not selecting multi-elements?", count: 9 },
        { query: "Can I trim video directly to vertical tiktok reel size?", count: 7 },
        { query: "How to request refund for active Pro Plan?", count: 5 },
        { query: "Is watercolor filter supporting high-res print export?", count: 3 }
      ];
      return res.status(200).json({ success: true, data: mockConfusion });
    }

    return res.status(200).json({ success: true, data: sortedConfusion });
  } catch (error) {
    console.error("[Analytics Controller] Error fetching confusion:", error);
    return res.status(500).json({ success: false, error: "Failed to load confusion analysis" });
  }
};

/**
 * @desc Get auto-mined FAQ recommendations
 */
export const getRecommendations = async (req, res) => {
  try {
    let recommendations = await SuggestedFAQ.find({ status: "New" }).sort({ hitCount: -1 });

    // Seed mock dynamic recommendations if empty to give a gorgeous first-run user experience
    if (!recommendations || recommendations.length === 0) {
      const mockFAQs = [
        {
          clusterName: "Canvas Layer Gradients",
          sampleQueries: ["How to apply gradient to background rectangle?", "Solid vs gradient shapes", "Add gradient background to editor"],
          suggestedQuestion: "How do I apply gradients to canvas backgrounds and shapes?",
          suggestedAnswer: "Applying gradients on the design canvas is fully supported:\n1. Click on the target background shape or element.\n2. In the design control panel, click the color fill thumbnail.\n3. Choose the **Gradient** tab in the color picker.\n4. Define linear/radial angles and select starting/stopping color stops to blend gradients smoothly.",
          hitCount: 24,
          avgSentiment: 0.42,
          status: "New"
        },
        {
          clusterName: "Multi-Selection Stacking",
          sampleQueries: ["Why is canvas drag not selecting multi-elements?", "Select multiple shapes at once", "Stack multi-selected shapes"],
          suggestedQuestion: "How do I select and group multiple layers on the Canvas?",
          suggestedAnswer: "You can easily select and reorder multiple elements concurrently:\n- Click and hold the **Shift key** on your keyboard, then select the canvas items sequentially.\n- Alternatively, click and drag a bounding selection rectangle across the canvas items to capture them.\n- Once selected, use re-stack shortcuts (**Ctrl + ]** to send forward or **Ctrl + [** to send backward) to shift them in unison.",
          hitCount: 18,
          avgSentiment: 0.38,
          status: "New"
        }
      ];
      return res.status(200).json({ success: true, data: mockFAQs });
    }

    return res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error("[Analytics Controller] Error fetching recommendations:", error);
    return res.status(500).json({ success: false, error: "Failed to load FAQ recommendations" });
  }
};

/**
 * @desc Trigger background Gemini FAQ clustering analysis
 */
export const triggerFaqMining = async (req, res) => {
  if (!GEMINI_KEY) {
    return res.status(400).json({
      success: false,
      error: "Gemini API key is not configured. Configure GEMINI_API_KEY in .env file."
    });
  }

  try {
    // 1. Fetch failing custom queries logged as AnalyticsEvents with FALLBACK_TRIGGERED
    const unresolvedEvents = await AnalyticsEvent.find({ eventType: "FALLBACK_TRIGGERED" })
      .select("payload.rawQuery")
      .limit(30);

    const rawQueriesList = unresolvedEvents
      .map(e => e.payload?.rawQuery)
      .filter(Boolean);

    if (rawQueriesList.length < 3) {
      return res.status(200).json({
        success: true,
        message: "Not enough raw unresolved logs yet to trigger semantic clustering (minimum of 3 required). Seeding default recommendations."
      });
    }

    const dataPrompt = JSON.stringify(rawQueriesList);

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
                You are a premium AI customer support systems analyst.
                Analyze the following list of raw user queries that triggered chatbot fallbacks:
                ${dataPrompt}
                
                Group them into logical "topic clusters". For each cluster:
                1. Identify the core intent of the questions (Cluster Name).
                2. Propose a clean, friendly "Frequently Asked Question" (Question Text) that matches this intent.
                3. Draft a precise, highly readable "Predefined Answer" (Answer Text) in markdown format. Make sure it provides complete resolutions.
                4. List the exact raw user queries that match this cluster.
                
                Return the result as a strict, valid JSON array conforming to this structure:
                [{
                  "clusterName": "Cluster Identity name",
                  "sampleQueries": ["raw user query 1", "raw user query 2"],
                  "suggestedQuestion": "Clean Proposed Question?",
                  "suggestedAnswer": "Complete Predefined Answer Text (Markdown)",
                  "hitCount": total count of hits matching this cluster
                }]
              `
            }
          ]
        }
      ]
    };

    console.log("[Analytics Pipeline] Dispatched query clustering to Gemini...");
    const response = await axios.post(GEMINI_API_URL, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000
    });

    const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) {
      throw new Error("Received empty response text from Gemini API.");
    }

    // Clean JSON response block markers using ultra-robust regex brace-matching
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to extract a valid JSON FAQ cluster array from AI response: " + aiText);
    }
    const parsedClusters = JSON.parse(jsonMatch[0]);

    for (const cluster of parsedClusters) {
      await SuggestedFAQ.findOneAndUpdate(
        { clusterName: cluster.clusterName },
        {
          $set: {
            suggestedQuestion: cluster.suggestedQuestion,
            suggestedAnswer: cluster.suggestedAnswer,
            sampleQueries: cluster.sampleQueries,
            hitCount: cluster.hitCount || 1,
            status: "New"
          }
        },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "FAQ mining pipeline executed successfully!",
      clustersCreated: parsedClusters.length
    });

  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error("[Analytics Controller] FAQ Pipeline failed:", errMsg);
    return res.status(500).json({ success: false, error: errMsg });
  }
};

/**
 * @desc Retrieve all conversations in support CRM
 */
export const getConversations = async (req, res) => {
  try {
    let list = await Conversation.find().populate("userProfile").sort({ "metadata.lastMessageAt": -1 });

    // Seed visual CRM conversations if empty to show a gorgeous Zendesk inbox off the bat!
    if (!list || list.length === 0) {
      console.log("[Support CRM] No conversations found. Seeding initial profile & chat log...");
      
      let profile = await UserProfile.findOne({ email: "designer_star@gmail.com" });
      if (!profile) {
        profile = await UserProfile.create({
          email: "designer_star@gmail.com",
          name: "Seraphina Stone",
          phone: "+1 (555) 382-9901",
          subscriptionPlan: "Pro",
          geo: { country: "United States", city: "San Francisco", timezone: "America/Los_Angeles" },
          system: { browser: "Chrome 122.0", os: "macOS Sonoma", deviceType: "Desktop" },
          metrics: { sessionCount: 14, totalAiQueries: 48, totalPredefinedClicks: 32 }
        });
      }

      let chat = await Conversation.findOne({ conversationId: "session_design_star_crm" });
      if (!chat) {
        chat = await Conversation.create({
          conversationId: "session_design_star_crm",
          userProfile: profile._id,
          status: "Escalated",
          isHumanTakeoverActive: true,
          metadata: {
            tags: ["billing", "export_failed", "pro_tier"],
            unreadCount: 1,
            lastMessageText: "I tried downloading my design frame canvas as a layered PSD but it timed out twice.",
            lastMessageAt: new Date()
          },
          leadScore: 84,
          overallSentiment: "Frustrated"
        });
      }

      list = await Conversation.find().populate("userProfile").sort({ "metadata.lastMessageAt": -1 });
    }

    // Deduplicate by user profile email/id to eliminate historical redundancy in the UI
    const seenUsers = new Set();
    const deduplicatedList = [];

    for (const conv of list) {
      if (conv.userProfile) {
        const userEmail = conv.userProfile.email;
        if (userEmail) {
          if (seenUsers.has(userEmail)) {
            continue; // Skip older redundant conversation
          }
          seenUsers.add(userEmail);
        }
      }
      deduplicatedList.push(conv);
    }

    return res.status(200).json({ success: true, data: deduplicatedList });
  } catch (error) {
    console.error("[Support CRM] Error fetching inbox list:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch support inbox conversations." });
  }
};

/**
 * @desc Get detailed message threads & AI summaries
 */
export const getConversationById = async (req, res) => {
  const { id } = req.params;

  try {
    const [conversation, messages, notes, summary] = await Promise.all([
      Conversation.findOne({ conversationId: id }).populate("userProfile"),
      ConversationMessage.find({ conversationId: id }).sort({ timestamp: 1 }),
      AdminNote.find({ conversationId: id }).sort({ createdAt: -1 }),
      ConversationSummary.findOne({ conversationId: id })
    ]);

    if (!conversation) {
      return res.status(404).json({ success: false, error: `Conversation thread ${id} not found.` });
    }

    // Reset unread counts on open
    conversation.metadata.unreadCount = 0;
    await conversation.save();

    // Seed mock detailed logs if empty (only for the seeded mock conversation session)
    if (messages.length === 0 && id === "session_design_star_crm") {
      const mockMessages = [
        {
          conversationId: id,
          sender: { role: "user" },
          text: "Hi, I am trying to export a 1080x1080 social media graphic.",
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          conversationId: id,
          sender: { role: "model" },
          text: "Hello! To export your design canvas, click on the **Export** button in the top right. You can choose PNG or high-definition PDF standard formats.",
          timestamp: new Date(Date.now() - 3000000)
        },
        {
          conversationId: id,
          sender: { role: "user" },
          text: "Yes, but I tried exporting it as a layered PSD file (using Pro features) and the server timed out twice. I need to edit this in Photoshop.",
          timestamp: new Date(Date.now() - 600000)
        }
      ];

      await ConversationMessage.insertMany(mockMessages);

      await AdminNote.create({
        conversationId: id,
        author: req.user?._id || "60a1180ed174dfa068b44666",
        authorName: "System Auto-Annotator",
        text: "User is on the Pro tier but experienced timeouts. Server log trace indicates layer dimensions exceeded maximum heap buffer allocations."
      });

      await ConversationSummary.create({
        conversationId: id,
        summaryText: "User experienced layered PSD canvas export timeouts on the Pro tier.",
        detectedIssue: "Canvas layer buffer heap timeout during Photoshop PSD compiler execution.",
        probableIntent: "Photoshop compatibility layer exporting.",
        suggestedAction: "Check PSD compiler memory limits, manually convert canvas dimensions, or offer premium onboarding support.",
        escalationRisk: "High",
        lastAnalyzedMessageCount: 3
      });

      // Query database again to return the seeded files
      const [messagesSeeded, notesSeeded, summarySeeded] = await Promise.all([
        ConversationMessage.find({ conversationId: id }).sort({ timestamp: 1 }),
        AdminNote.find({ conversationId: id }).sort({ createdAt: -1 }),
        ConversationSummary.findOne({ conversationId: id })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          conversation,
          messages: messagesSeeded,
          notes: notesSeeded,
          summary: summarySeeded
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        conversation,
        messages,
        notes,
        summary
      }
    });
  } catch (error) {
    console.error("[Support CRM] Error fetching chat details:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve conversation details." });
  }
};

/**
 * @desc Add private notes visible only to admins
 */
export const createAdminNote = async (req, res) => {
  const { conversationId, text } = req.body;

  if (!conversationId || !text) {
    return res.status(400).json({ success: false, error: "Field inputs 'conversationId' and 'text' are required." });
  }

  try {
    const note = await AdminNote.create({
      conversationId,
      author: req.user?._id || req.user?.id || "60a1180ed174dfa068b44666",
      authorName: req.user?.name || "System Admin",
      text: text.trim()
    });

    return res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error("[Support CRM] Error creating admin note:", error);
    return res.status(500).json({ success: false, error: "Failed to create internal note annotation." });
  }
};

/**
 * @desc Update chat thread status or takeover flag
 */
export const updateConversationStatus = async (req, res) => {
  const { conversationId, status, isHumanTakeoverActive } = req.body;

  try {
    const updates = {};
    if (status) updates.status = status;
    if (typeof isHumanTakeoverActive === "boolean") {
      updates.isHumanTakeoverActive = isHumanTakeoverActive;
    }

    const conversation = await Conversation.findOneAndUpdate(
      { conversationId },
      { $set: updates },
      { new: true }
    );

    return res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error("[Support CRM] Error adjusting ticket status:", error);
    return res.status(500).json({ success: false, error: "Failed to adjust conversation status parameters." });
  }
};

/**
 * @desc Background semantic LLM pipeline evaluating intent, sentiment, lead score & summaries
 */
export const runAiIntelligencePipeline = async (conversationId) => {
  if (!GEMINI_KEY) return;

  try {
    const messages = await ConversationMessage.find({ conversationId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    if (messages.length === 0) return;

    // Build dialogue nodes prompt
    const dialogPrompt = messages
      .reverse()
      .map((m) => `${m.sender.role.toUpperCase()}: ${m.text}`)
      .join("\n");

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
                Analyze this live customer support dialogue:
                ${dialogPrompt}
                
                Synthesize your analysis and return a strict JSON payload conforming exactly to this structure:
                {
                  "summary": "1-sentence context recap",
                  "detectedIssue": "Core roadblock they are experiencing",
                  "probableIntent": "What they are trying to do",
                  "suggestedAction": "Suggested next support reply or system adjustment",
                  "sentiment": "Happy" | "Neutral" | "Confused" | "Angry" | "Frustrated" | "Interested",
                  "leadScore": Number from 0 to 100 (score higher if they ask about pricing, Pro tier, upgrading, API access, or enterprise scaling),
                  "escalationRisk": "Low" | "Medium" | "High"
                }
              `
            }
          ]
        }
      ]
    };

    console.log(`[Support CRM AI Pipeline] Dispatched session context evaluation for: ${conversationId}`);
    const response = await axios.post(GEMINI_API_URL, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000
    });

    const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) return;

    // Clean JSON response block markers using ultra-robust regex brace-matching
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("[CRM AI Pipeline] Failed to extract valid JSON brace blocks from: ", aiText);
      return;
    }
    const result = JSON.parse(jsonMatch[0]);

    // 1. Update overall conversation stats
    await Conversation.findOneAndUpdate(
      { conversationId },
      { 
        $set: { 
          overallSentiment: result.sentiment || "Neutral",
          leadScore: result.leadScore || 0 
        } 
      }
    );

    // 2. Upsert Intelligence Summary
    await ConversationSummary.findOneAndUpdate(
      { conversationId },
      {
        $set: {
          summaryText: result.summary,
          detectedIssue: result.detectedIssue,
          probableIntent: result.probableIntent,
          suggestedAction: result.suggestedAction,
          escalationRisk: result.escalationRisk || "Low",
          lastAnalyzedMessageCount: messages.length
        }
      },
      { upsert: true }
    );

    console.log(`[Support CRM AI Pipeline] Successfully completed evaluations for session: ${conversationId}`);
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error("[Support CRM AI Pipeline Error]:", errMsg);
  }
};

/**
 * @desc Post an admin reply message to a client conversation
 */
export const createAdminReply = async (req, res) => {
  const { conversationId, text } = req.body;

  if (!conversationId || !text) {
    return res.status(400).json({ success: false, error: "Field inputs 'conversationId' and 'text' are required." });
  }

  try {
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return res.status(404).json({ success: false, error: "Conversation not found." });
    }

    // 1. Create message
    const message = await ConversationMessage.create({
      conversationId,
      sender: { role: "admin", adminId: req.user?._id || req.user?.id || null },
      text: text.trim(),
      timestamp: new Date()
    });

    // 2. Update conversation metadata
    conversation.metadata.lastMessageText = text.trim();
    conversation.metadata.lastMessageAt = new Date();
    conversation.metadata.unreadCount = 0; // Admin replied, so reset unread count
    await conversation.save();

    // 3. Trigger background LLM pipeline to update evaluations if needed
    runAiIntelligencePipeline(conversationId).catch(e =>
      console.error("[Support CRM AI Pipeline Background Err]:", e)
    );

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error("[Support CRM] Error creating admin reply:", error);
    return res.status(500).json({ success: false, error: "Failed to post support reply." });
  }
};
