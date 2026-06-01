import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "CHAT_OPEN",
        "CHAT_CLOSE",
        "PREDEFINED_CLICK",
        "AI_QUERY",
        "FLOW_TRANSITION",
        "FILE_VIEW",
        "PDF_OPEN",
        "VIDEO_PLAY",
        "FALLBACK_TRIGGERED",
        "SESSION_END"
      ],
      index: true,
    },
    // Event specific payloads
    payload: {
      flowId: { type: String, index: true },       // Used in transitions & clicks
      targetFlowId: { type: String },               // Used in transitions
      rawQuery: { type: String },                   // Raw text inputted by the user
      aiReply: { type: String },                    // Response returned by Gemini
      fileType: { type: String, enum: ["photo", "video", "pdf"] },
      fileUrl: { type: String },
      durationSeconds: { type: Number },            // Video play length, time on flow
      sentimentScore: { type: Number },             // Calculated sentiment of query (-1 to 1)
      wasAnswered: { type: Boolean, default: true } // If AI successfully matched user intent
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    }
  },
  { timestamps: false }
);

// Compound indexes for transition maps and sequential flows
analyticsEventSchema.index({ "payload.flowId": 1, eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: 1 });

export default mongoose.model("AnalyticsEvent", analyticsEventSchema);
