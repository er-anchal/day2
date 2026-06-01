import mongoose from "mongoose";

const conversationMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    sender: {
      role: { type: String, enum: ["user", "model", "admin"], required: true, index: true },
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    },
    text: { type: String, required: true },
    attachments: [
      {
        fileType: { type: String, enum: ["photo", "video", "pdf"] },
        fileUrl: { type: String, required: true },
        fileName: String,
        fileSizeBytes: Number
      }
    ],
    sentiment: { 
      type: String, 
      enum: ["Happy", "Neutral", "Confused", "Angry", "Frustrated", "Interested"],
      default: "Neutral"
    },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

conversationMessageSchema.index({ conversationId: 1, timestamp: 1 });

export default mongoose.model("ConversationMessage", conversationMessageSchema);
