import mongoose from "mongoose";

const conversationSummarySchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    summaryText: { type: String, required: true },
    detectedIssue: { type: String, required: true },
    probableIntent: { type: String, required: true },
    suggestedAction: { type: String, required: true },
    escalationRisk: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    lastAnalyzedMessageCount: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("ConversationSummary", conversationSummarySchema);
