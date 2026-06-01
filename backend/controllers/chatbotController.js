import axios from "axios";
import dotenv from "dotenv";
import ChatbotFlow from "../models/ChatbotFlow.js";
import ConversationMessage from "../models/ConversationMessage.js";
import Conversation from "../models/Conversation.js";
import UserProfile from "../models/UserProfile.js";
import { runAiIntelligencePipeline } from "./analyticsController.js";

dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY
  ? process.env.GEMINI_API_KEY.trim().replace(/^["']|["']$/g, "")
  : "";

// Predefined default flows to seed if MongoDB is empty (English-only)
const DEFAULT_CHATBOT_FLOWS = [
  {
    id: "main",
    question: "Return to Main Menu",
    answer: "Returning to the main options. Choose a topic below for instant support or ask a custom question:",
    followUps: ["canvas_main", "trendy_main", "jewellery_main", "video_main", "pricing_main", "enhancer_main"],
    isReset: true
  },
  {
    id: "canvas_main",
    question: "How to use the Design Canvas?",
    answer: "The Design Canvas (Fabric.js) allows you to create professional social media graphics:\n1. Choose a layout category or template preset (Square Post: 1080x1080, or Banner: 1200x400) from the admin panel.\n2. Add Textbox elements using the toolbar, and customize their font families, sizing, colors, and line alignments.\n3. Add SVG vectors or geometric Shapes (like Rectangles or Circles) and adjust their border strokes.\n4. Upload your custom images or layer videos directly onto the designer surface.",
    followUps: ["canvas_shortcuts", "canvas_crop", "main"]
  },
  {
    id: "canvas_shortcuts",
    question: "What Keyboard Shortcuts are supported on Canvas?",
    answer: "You can quickly organize and reorder element layers on the Design Canvas with these shortcuts:\n- **Ctrl + ]** (Cmd + ] on Mac) to bring the selected element one step forward.\n- **Ctrl + [** (Cmd + [ on Mac) to send the selected element one step backward.\n- Select an element and press **Delete** or **Backspace** to instantly remove it.",
    followUps: ["canvas_crop", "main"]
  },
  {
    id: "canvas_crop",
    question: "How do I crop images on the Canvas?",
    answer: "To crop an image on the Canvas:\n1. Click on the target image to select it.\n2. Click the **Crop** button on the control panel.\n3. Left-click and drag a selection rectangle over the portion of the image you want to keep.\n4. Release or click Apply to automatically crop and clip the image into that bounds.",
    followUps: ["canvas_shortcuts", "main"]
  },
  {
    id: "trendy_main",
    question: "What is the Trendy AI Avatar Generator?",
    answer: "The Trendy AI generator transforms uploaded portrait photos into stylized art figures using advanced AI modeling:\n1. **Collectible Figurine**: Formats your model inside a premium Bandai/Funko Pop display box.\n2. **3D Claymation**: Renders a cute smooth-clay avatar seated atop glowing social media icons.\n3. **Watercolor Anime**: Renders a gorgeous hand-painted watercolor anime portrait.",
    followUps: ["trendy_skin", "trendy_pipeline", "main"]
  },
  {
    id: "trendy_skin",
    question: "How does the Anime AI preserve skin tones?",
    answer: "Traditional AI filters frequently struggle with ethnic skin tones. Our Trendy AI generator integrates custom bias-correction prompt rules. These force the generative engine to strictly retain the exact skin tone extracted from your original photo, rendering dark, medium, and brown skin tones accurately using warm watercolor washes.",
    followUps: ["trendy_pipeline", "main"]
  },
  {
    id: "trendy_pipeline",
    question: "How does the AI process my Trendy photo?",
    answer: "When you upload a portrait:\n1. **Gemini AI** performs a structured inspection, extracting features (skin tone, face shape, hair style, garment layers, and accessories).\n2. A detailed prompt is built automatically based on these traits.\n3. The prompt is sent to **Flux** via Pollinations. If the queue is busy, the backend automatically retries using a premium **Google Imagen 4** fallback route.",
    followUps: ["trendy_skin", "main"]
  },
  {
    id: "jewellery_main",
    question: "How to use the Jewellery Try-On AI?",
    answer: "Our Jewellery Try-On AI overlays jewellery ornaments onto realistic human models seamlessly:\n1. Navigate to the **Jewellery Generator** page.\n2. Choose an ornament type (Ring, Bangle, Pendant, or Ring & Bangle combination).\n3. Pick your model skin tone (White Fair, Medium, Olive, Brown, Black) or tabletop display scenery.\n4. Upload your own jewellery item or select from our preloaded high-definition samples.\n5. Click **Generate** to view the item blended onto the model's hand, arm, or chest.",
    followUps: ["jewellery_fail", "main"]
  },
  {
    id: "jewellery_fail",
    question: "What if the Jewellery Try-On fails to generate?",
    answer: "If you receive a 'busy engine' error:\n1. The AI generation queue is temporarily experiencing high traffic.\n2. Please wait 10-15 seconds and click **Re-Generate**.\n3. Make sure your uploaded image is clear and contains a single jewellery item on a plain background for optimal catalog extraction.",
    followUps: ["jewellery_main", "main"]
  },
  {
    id: "video_main",
    question: "How to edit Videos and Reels?",
    answer: "The Video Editor harnesses server-side FFmpeg processing to run professional adjustments:\n1. **Trim Video**: Cut and crop time ranges by specifying precise start/end timestamps.\n2. **Crop Video**: Adjust visual dimensions and crop spatial boundaries.\n3. **Burn Subtitles**: Type custom subtitling tracks and burn them in with customized colors and sizes.\n4. **Merge Clips**: Select multiple video files and merge them sequentially into a single MP4.",
    followUps: ["video_subtitles", "main"]
  },
  {
    id: "video_subtitles",
    question: "How are custom video subtitles rendered?",
    answer: "When you add custom subtitles:\n1. You specify text, timeline ranges (in seconds), font sizes, and custom colors.\n2. The server-side FFmpeg pipeline overlays these using a dedicated `drawtext` layer.\n3. It draws a semi-transparent black backing box to ensure your subtitles remain highly legible regardless of light or complex video backdrops.",
    followUps: ["video_main", "main"]
  },
  {
    id: "pricing_main",
    question: "What Subscription Plans are available?",
    answer: "We offer tailored plans to scale your design capabilities:\n- **Free Plan**: Access to standard canvas features, basic templates, and standard processing speed.\n- **Pro Plan**: Unlocks all premium templates, priority generation for Trendy AI and Jewellery Try-On, full HD video exporting, and unlimited background removals.\n- **Enterprise Plan**: For agencies needing dedicated API speeds, multi-user role access controls, and customized template systems.",
    followUps: ["pricing_upgrade", "main"]
  },
  {
    id: "pricing_upgrade",
    question: "How do I upgrade to Pro/Premium?",
    answer: "To upgrade to a premium plan:\n1. Click on **Pricing** in the navigation bar.\n2. Browse our available plans and click the **Subscribe** button on your preferred tier.\n3. Complete the checkout process to instantly activate premium AI capabilities and higher export limits on your account.",
    followUps: ["pricing_main", "main"]
  },
  {
    id: "enhancer_main",
    question: "How to use the Image Enhancer?",
    answer: "Our premium Image Enhancer utilizes advanced AI super-resolution algorithms:\n1. Navigate to the **Enhancer** page from the sidebar or menu.\n2. Upload any low-resolution, blurred, or noisy image.\n3. The AI model will process the image, perform automatic denoising, sharpen fine details, and upscale it up to 4x while preserving natural textures.\n4. Download your enhanced high-definition image instantly.",
    followUps: ["main"]
  }
];

// Handles AI premium conversational prompting
export const queryChatbot = async (req, res) => {
  const { message, history, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  // Sync session & messages with CRM database in real-time
  let profile = null;
  let conversation = null;

  if (sessionId && req.user && req.user.email) {
    try {
      profile = await UserProfile.findOne({ email: req.user.email });
      if (!profile) {
        profile = await UserProfile.create({
          userId: req.user._id || req.user.id || null,
          email: req.user.email,
          name: req.user.name || "Anonymous Guest",
          phone: req.user.phone || "",
          subscriptionPlan: req.user.subscriptionPlan || "Free",
          geo: { country: "India" },
          system: { browser: "Chrome", os: "Windows", deviceType: "Desktop" },
          metrics: { sessionCount: 1, totalAiQueries: 1, totalPredefinedClicks: 0 }
        });
      } else {
        profile.phone = req.user.phone || profile.phone || "";
        profile.metrics.totalAiQueries += 1;
        profile.metrics.lastActiveAt = new Date();
        await profile.save();
      }

      conversation = await Conversation.findOne({ conversationId: sessionId });
      if (!conversation) {
        conversation = await Conversation.create({
          conversationId: sessionId,
          userProfile: profile._id,
          status: "Open",
          isHumanTakeoverActive: false,
          metadata: {
            tags: ["live_chat"],
            unreadCount: 1,
            lastMessageText: message,
            lastMessageAt: new Date()
          }
        });
      } else {
        conversation.metadata.unreadCount += 1;
        conversation.metadata.lastMessageText = message;
        conversation.metadata.lastMessageAt = new Date();
        await conversation.save();
      }

      // Log User message
      await ConversationMessage.create({
        conversationId: sessionId,
        sender: { role: "user" },
        text: message,
        timestamp: new Date()
      });
    } catch (dbErr) {
      console.error("[Chatbot CRM Sync Error - User Message]:", dbErr);
    }
  }

  // Intercept if Human Takeover is active, bypassing LLM prompt generation
  if (conversation && conversation.isHumanTakeoverActive) {
    console.log(`[Chatbot] Session ${sessionId} is under active human takeover. Bypassing Gemini.`);
    return res.json({
      success: true,
      reply: "Message received. A support agent is currently handling your session and will type back shortly!"
    });
  }

  let chatContents = [];

  if (history && Array.isArray(history)) {
    chatContents = history.map((msg) => ({
      role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.text || msg.content || "" }],
    }));
  }

  chatContents.push({
    role: "user",
    parts: [{ text: message }],
  });

  const model = "gemini-2.5-flash";
  const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;

  const requestBody = {
    contents: chatContents,
    systemInstruction: {
      parts: [
        {
          text:
            "You are 'AI Image & Template Editor Assistant', a premium and extremely helpful AI chatbot integrated directly into the image and template editor website. " +
            "You guide users on how to navigate the platform and use its key features: " +
            "1. Design Canvas Editor (built on Fabric.js): Create square posts (1080x1080) and banners (1200x400), add textboxes, customize fonts, colors, alignments, add shapes (rectangles, circles), apply solid or gradient backgrounds, crop uploaded photos, re-stack layer positions using shortcuts (Ctrl + ] or Ctrl + [), and overlay videos on the canvas. " +
            "2. Trendy Template Generator: Turn personal portraits into 3D Funko-pop style figurines, Blender claymation avatars, or gorgeous hand-painted watercolor anime portraits. " +
            "3. Jewellery Try-On AI: Select rings, bangles, pendants, or combination packages and blend them onto virtual models of varying skin tones (White Fair, Medium, Olive, Brown, Black) or tabletop backdrops. " +
            "4. Video & Reel Editor: Trim clips, crop video layouts, merge multiple clips together, and burn in custom colored subtitles using FFmpeg. " +
            "Always be polite, professional, and precise. Answer strictly in English only. Never respond in Hindi, Hinglish, or any other language, even if the user prompts you in another language. Give concise step-by-step instructions.",
        },
      ],
    },
  };

  try {
    console.log(`[Chatbot] Directing query to Gemini using ${model}...`);
    const response = await axios.post(directUrl, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });

    const aiReply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiReply) {
      throw new Error("Received empty content from Gemini AI API.");
    }

    // Save AI response to database
    if (sessionId && conversation) {
      try {
        await ConversationMessage.create({
          conversationId: sessionId,
          sender: { role: "model" },
          text: aiReply,
          timestamp: new Date()
        });

        conversation.metadata.lastMessageText = aiReply;
        conversation.metadata.lastMessageAt = new Date();
        await conversation.save();

        // Run AI intelligence analysis pipeline in background
        runAiIntelligencePipeline(sessionId).catch(e =>
          console.error("[Support CRM AI Pipeline Background Err]:", e)
        );
      } catch (dbErr) {
        console.error("[Chatbot CRM Sync Error - AI Message]:", dbErr);
      }
    }

    res.json({
      success: true,
      reply: aiReply,
    });
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error("[Chatbot] Gemini API query failed:", errMsg);

    let fallbackReply =
      "I'm sorry, I am having trouble connecting to my AI core right now. However, I can help you with standard functions! You can use our Design Canvas to create banners, the Trendy Generator to create custom avatars, or our Video Editor to trim and merge clips. Please try sending your custom query again in a moment.";

    if (errMsg.includes("API key not valid")) {
      fallbackReply =
        "The server's Gemini API key appears to be invalid or unconfigured. Please configure a valid GEMINI_API_KEY in the backend `.env` file to enable premium conversational intelligence.";
    }

    // Save fallback response to database
    if (sessionId && conversation) {
      try {
        await ConversationMessage.create({
          conversationId: sessionId,
          sender: { role: "model" },
          text: fallbackReply,
          timestamp: new Date()
        });

        conversation.metadata.lastMessageText = fallbackReply;
        conversation.metadata.lastMessageAt = new Date();
        await conversation.save();

        // Run AI intelligence analysis pipeline in background
        runAiIntelligencePipeline(sessionId).catch(e =>
          console.error("[Support CRM AI Pipeline Background Err]:", e)
        );
      } catch (dbErr) {
        console.error("[Chatbot CRM Sync Error - Fallback Message]:", dbErr);
      }
    }

    res.json({
      success: false,
      reply: fallbackReply,
      error: errMsg,
    });
  }
};


// GET: All chatbot predefined flows (with automatic database seeding)
export const getChatbotFlows = async (req, res) => {
  try {
    let flows = await ChatbotFlow.find().sort({ createdAt: 1 });

    // Seed database if empty
    if (!flows || flows.length === 0) {
      console.log("[Chatbot] No predefined flows found in MongoDB. Seeding initial flows...");
      await ChatbotFlow.insertMany(DEFAULT_CHATBOT_FLOWS);
      flows = await ChatbotFlow.find().sort({ createdAt: 1 });
    }

    res.json({
      success: true,
      flows,
    });
  } catch (error) {
    console.error("[Chatbot] Error fetching chatbot flows:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve predefined chatbot flows.",
    });
  }
};

// POST: Upsert predefined chatbot flow (Create or Update)
export const upsertChatbotFlow = async (req, res) => {
  const { id, question, answer, followUps, isReset, photoUrl, videoUrl, pdfUrl } = req.body;

  if (!id || !question || !answer) {
    return res.status(400).json({
      success: false,
      error: "Field inputs 'id', 'question', and 'answer' are required.",
    });
  }

  try {
    const formattedId = id.trim().toLowerCase().replace(/\s+/g, "_");

    const flow = await ChatbotFlow.findOneAndUpdate(
      { id: formattedId },
      {
        id: formattedId,
        question: question.trim(),
        answer: answer.trim(),
        followUps: Array.isArray(followUps) ? followUps : [],
        isReset: !!isReset,
        photoUrl: photoUrl ? photoUrl.trim() : "",
        videoUrl: videoUrl ? videoUrl.trim() : "",
        pdfUrl: pdfUrl ? pdfUrl.trim() : "",
      },
      { upsert: true, new: true }
    );

    console.log(`[Chatbot] Flow upserted successfully: ${formattedId}`);
    res.json({
      success: true,
      flow,
    });
  } catch (error) {
    console.error("[Chatbot] Error upserting flow:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to save predefined chatbot flow.",
    });
  }
};

// DELETE: Remove chatbot flow by custom ID
export const deleteChatbotFlow = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, error: "Flow id parameter is required." });
  }

  try {
    const result = await ChatbotFlow.findOneAndDelete({ id: id.toLowerCase().trim() });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: `No chatbot flow found with id: ${id}`,
      });
    }

    console.log(`[Chatbot] Flow deleted: ${id}`);
    res.json({
      success: true,
      message: "Predefined chatbot flow deleted successfully.",
    });
  } catch (error) {
    console.error("[Chatbot] Error deleting flow:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to delete predefined chatbot flow.",
    });
  }
};

// GET: Fetch client chat history for a specific session
export const getChatbotHistory = async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Session ID is required." });
  }

  try {
    const messages = await ConversationMessage.find({ conversationId: sessionId }).sort({ timestamp: 1 });
    
    const formatted = messages.map(msg => ({
      role: msg.sender.role,
      text: msg.text,
      timestamp: msg.timestamp
    }));

    res.json({
      success: true,
      messages: formatted
    });
  } catch (error) {
    console.error("[Chatbot Controller] History fetch failed:", error.message);
    res.status(500).json({ success: false, error: "Failed to retrieve chat history." });
  }
};
