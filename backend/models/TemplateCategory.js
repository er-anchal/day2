import mongoose from "mongoose";

const templateCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    isActive: {
      type: Number,
      default: 0,
    },
    deletedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("TemplateCategory", templateCategorySchema);
