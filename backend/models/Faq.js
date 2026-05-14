import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["General", "Product Shoot", "Pricing", "Jewellery", "Images & Videos", "Account & Usage"],
      default: "General"
    },
    shortDescription: {
      type: String,
    },
    answer: {
      type: String,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    images: {
      type: [String],
      default: [],
    },
    video: {
      type: String,
      default: "",
    },
    pdf: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Faq", faqSchema);
