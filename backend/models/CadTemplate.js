import mongoose from "mongoose";

const cadTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      enum: ["ring", "pendant", "bangle", "article"], 
      required: true,
      index: true
    },
    stlUrl: { type: String, required: true },      // path to 3D stl mesh file
    fileType: { 
      type: String, 
      enum: ["stl", "glb", "gltf", "obj", "3dm"], 
      default: "stl" 
    },
    imageUrl: { type: String, default: "" },       // fallback 2D base image layer
    basePrice: { type: Number, required: true },   // base price premium
    metalWeight: { type: Number, default: 4.5 },   // alloy base weight in grams
    additionalFiles: {
      type: [
        {
          role: { type: String, enum: ["visual", "production", "specsheet", "other"], default: "production" },
          url: { type: String, required: true },
          fileType: { type: String, required: true },
          originalName: { type: String, default: "" }
        }
      ],
      default: []
    },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export default mongoose.model("CadTemplate", cadTemplateSchema);
