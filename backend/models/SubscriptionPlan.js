import mongoose from "mongoose";

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    recommended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
