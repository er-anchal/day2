import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    email: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, default: "Anonymous Guest" },
    phone: { type: String, trim: true },
    subscriptionPlan: { 
      type: String, 
      enum: ["Free", "Pro", "Enterprise"], 
      default: "Free",
      index: true
    },
    geo: {
      country: { type: String, default: "Unknown" },
      city: String,
      timezone: String,
    },
    system: {
      browser: String,
      os: String,
      deviceType: String,
    },
    metrics: {
      sessionCount: { type: Number, default: 1 },
      totalAiQueries: { type: Number, default: 0 },
      totalPredefinedClicks: { type: Number, default: 0 },
      lastActiveAt: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

export default mongoose.model("UserProfile", userProfileSchema);
