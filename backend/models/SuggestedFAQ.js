import mongoose from "mongoose";

const suggestedFAQSchema = new mongoose.Schema(
  {
    clusterName: {
      type: String,
      required: true,
      unique: true,
    },
    sampleQueries: [{ type: String }],
    suggestedQuestion: {
      type: String,
      required: true,
    },
    suggestedAnswer: {
      type: String,
      required: true,
    },
    hitCount: {
      type: Number,
      default: 0,
      index: true,
    },
    avgSentiment: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["New", "Approved", "Dismissed"],
      default: "New",
      index: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("SuggestedFAQ", suggestedFAQSchema);
