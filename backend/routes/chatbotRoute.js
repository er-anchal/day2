import express from "express";
import {
  queryChatbot,
  getChatbotFlows,
  upsertChatbotFlow,
  deleteChatbotFlow,
  getChatbotHistory,
} from "../controllers/chatbotController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import chatbotUpload from "../middleware/chatbotUploadMiddleware.js";

const router = express.Router();

// Protected route to handle chatbot queries
router.post("/query", authMiddleware, queryChatbot);

// Fetch client conversation history from database
router.get("/history/:sessionId", authMiddleware, getChatbotHistory);

// Predefined hierarchical questions CRUD
router.get("/flows", authMiddleware, getChatbotFlows);
router.post("/flows", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), upsertChatbotFlow);
router.delete("/flows/:id", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), deleteChatbotFlow);

// Route to handle dynamic file uploading for chatbot media (image, video, PDF)
router.post(
  "/flows/upload",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER ADMIN"]),
  chatbotUpload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded!" });
      }

      // Return public URL path
      const fileUrl = `/uploads/chatbot/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: "File uploaded successfully!",
        fileUrl: fileUrl,
      });
    } catch (error) {
      console.error("[Chatbot Upload Error]:", error);
      res.status(500).json({ success: false, error: "Server error during file upload" });
    }
  }
);

export default router;
