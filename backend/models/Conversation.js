import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    userProfile: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile", required: true, index: true },
    status: {
      type: String,
      enum: ["Open", "Pending", "Resolved", "Escalated"],
      default: "Open",
      index: true
    },
    assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    isHumanTakeoverActive: { type: Boolean, default: false, index: true },
    metadata: {
      tags: [{ type: String, index: true }], // e.g. ["billing", "canvas_bug", "high_value"]
      unreadCount: { type: Number, default: 0 },
      lastMessageText: String,
      lastMessageAt: { type: Date, default: Date.now, index: true }
    },
    leadScore: { type: Number, default: 0, index: true },
    overallSentiment: {
      type: String,
      enum: ["Happy", "Neutral", "Confused", "Angry", "Frustrated", "Interested"],
      default: "Neutral",
      index: true
    }
  },
  { timestamps: true }
);

conversationSchema.index({ "metadata.lastMessageAt": -1, status: 1 });

export default mongoose.model("Conversation", conversationSchema);
