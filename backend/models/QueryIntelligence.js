import mongoose from "mongoose";

const queryIntelligenceSchema = new mongoose.Schema(
  {
    rawQuery: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    normalizedIntent: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true, // e.g. "Billing", "Canvas Help", "Bug Report"
    },
    sentimentScore: {
      type: Number, // -1 (frustrated) to 1 (happy)
      required: true,
    },
    embedding: {
      type: [Number], // Gemini embedding dimensions (e.g. 768 or 1536)
      default: []
    },
    hitCount: {
      type: Number,
      default: 1,
      index: true,
    },
    lastTriggeredAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

queryIntelligenceSchema.index({ normalizedIntent: "text", rawQuery: "text" });

export default mongoose.model("QueryIntelligence", queryIntelligenceSchema);
