import mongoose from "mongoose";

// Material Alloy Presets
const materialPresetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  label: { type: String, required: true },
  color: { type: String, required: true },       // Hex code representation
  metalness: { type: Number, default: 1.0 },
  roughness: { type: Number, default: 0.1 },
  basePrice: { type: Number, required: true }
});

// Gemstone Cut/Refraction Presets
const gemstonePresetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  label: { type: String, required: true },
  color: { type: String, required: true },
  pricePerCarat: { type: Number, required: true },
  ior: { type: Number, default: 1.76 }           // Index of refraction
});

export const MaterialPreset = mongoose.model("MaterialPreset", materialPresetSchema);
export const GemstonePreset = mongoose.model("GemstonePreset", gemstonePresetSchema);
