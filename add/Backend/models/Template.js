import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema(
  {
    // ───────────── Category Info ─────────────
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TemplateCategory",
      required: true,
      index: true,
    },

    categoryName: {
      type: String,
      required: true,
      trim: true,
    },

    categorySlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // ───────────── SubCategory Info ─────────────
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TemplateSubCategory",
      required: true,
      index: true,
    },

    subcategoryName: {
      type: String,
      required: true,
      trim: true,
    },

    subcategorySlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // ───────────── File Info ─────────────
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional template title
    name: {
      type: String,
      default: "",
      trim: true,
    },

    // ───────────── Status ─────────────
    isActive: {
      type: Number,
      default: 0, // 0 = Active, 1 = Deleted/Inactive
      index: true,
    },

    // ───────────── Audit Fields ─────────────
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

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// ───────────── Indexes ─────────────
TemplateSchema.index({ createdAt: -1 });
TemplateSchema.index({ categoryId: 1, subcategoryId: 1 });
TemplateSchema.index({ categorySlug: 1, subcategorySlug: 1 });

export const Template = mongoose.model("Template", TemplateSchema);
