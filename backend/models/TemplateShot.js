import mongoose from "mongoose";

const TemplateShotSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TemplateCategory",
      required: true,
    },

    categoryName: String,
    categorySlug: String,

    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TemplateSubCategory",
      required: true,
    },

    subcategoryName: String,
    subcategorySlug: String,

    imageUrl: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const TemplateShot = mongoose.model("TemplateShot", TemplateShotSchema);
