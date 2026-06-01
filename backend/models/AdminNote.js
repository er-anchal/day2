import mongoose from "mongoose";

const adminNoteSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("AdminNote", adminNoteSchema);
