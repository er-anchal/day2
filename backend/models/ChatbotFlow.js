import mongoose from "mongoose";

const chatbotFlowSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
    followUps: {
      type: [String],
      default: [],
    },
    isReset: {
      type: Boolean,
      default: false,
    },
    photoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    pdfUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChatbotFlow", chatbotFlowSchema);
