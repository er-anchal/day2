import mongoose from "mongoose";

const templateSubCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
    },

    // 🔥 RELATION (IMPORTANT)
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TemplateCategory",
      required: true,
    },

    // 🔥 DENORMALIZED DISPLAY FIELD (FAST UI)
    categoryName: {
      type: String,
      required: true,
    },

    isActive: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    deletedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("TemplateSubCategory", templateSubCategorySchema);
