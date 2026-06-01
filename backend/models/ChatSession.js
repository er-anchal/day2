import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      userId: { type: String, index: true },
      email: { type: String, trim: true },
      ipAddress: String,
      userAgent: String,
      deviceType: { 
        type: String, 
        enum: ["Desktop", "Tablet", "Mobile", "Unknown"],
        default: "Desktop"
      },
    },
    meta: {
      startedAt: { type: Date, default: Date.now },
      endedAt: Date,
      durationSeconds: { type: Number, default: 0 },
    },
    metrics: {
      totalPredefinedClicks: { type: Number, default: 0 },
      totalAiQueries: { type: Number, default: 0 },
      totalFallbacks: { type: Number, default: 0 },
      totalFileViews: { type: Number, default: 0 },
      sentimentScoreAverage: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Abandoned"],
      default: "Active",
      index: true,
    },
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for super-fast dashboard range queries
chatSessionSchema.index({ "meta.startedAt": -1, status: 1 });
chatSessionSchema.index({ "metrics.totalFallbacks": -1 });

export default mongoose.model("ChatSession", chatSessionSchema);
