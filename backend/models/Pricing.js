import mongoose from "mongoose";

const PricingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    planName: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"], 
      default: "FREE",
      required: true,
    },
    
    type: {
      type: String,
      enum: ["free", "weekly", "monthly", "yearly"],
      default: "free",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      default: 0,
    },

    imageCredits: {
      allocated: { type: Number, default: 100 }, 
      used: { type: Number, default: 0 },     
    },
    
    videoCredits: {
      allocated: { type: Number, default: 5 },
      used: { type: Number, default: 0 },
    },

    maxUser: {
      type: Number,
      required: true,
      default: 1,
    },

    durationDays: {
      type: Number,
      required: true,
      default: 0, 
    },

    features: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Number,
      default: 0, 
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("Pricing", PricingSchema);