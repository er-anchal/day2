import path from "path";
import CadTemplate from "../models/CadTemplate.js";
import { MaterialPreset, GemstonePreset } from "../models/ConfigPresets.js";

// Seed preset data if database collections are empty
const seedPresetsIfEmpty = async () => {
  const materialsCount = await MaterialPreset.countDocuments();
  if (materialsCount === 0) {
    await MaterialPreset.create([
      { id: "yellow_gold", label: "Yellow Gold", color: "#ffd700", metalness: 1.0, roughness: 0.1, basePrice: 850 },
      { id: "rose_gold", label: "Rose Gold", color: "#e6c2b4", metalness: 1.0, roughness: 0.1, basePrice: 800 },
      { id: "platinum", label: "Platinum / White Gold", color: "#e5e5e5", metalness: 1.0, roughness: 0.05, basePrice: 980 }
    ]);
  }

  const gemsCount = await GemstonePreset.countDocuments();
  if (gemsCount === 0) {
    await GemstonePreset.create([
      { id: "diamond", label: "Clear Diamond", color: "#ffffff", pricePerCarat: 2600, ior: 2.417 },
      { id: "ruby", label: "Ruby Red", color: "#e91e63", pricePerCarat: 1400, ior: 1.76 },
      { id: "emerald", label: "Emerald Green", color: "#4caf50", pricePerCarat: 1600, ior: 1.76 }
    ]);
  }
};

const seedTemplatesIfEmpty = async () => {
  const templatesCount = await CadTemplate.countDocuments();
  if (templatesCount === 0) {
    await CadTemplate.create([
      { name: "Solitaire Ring", category: "ring", stlUrl: "/models/lr_moti.stl", basePrice: 1500, metalWeight: 3.8 },
      { name: "Halo Pendant", category: "pendant", stlUrl: "", basePrice: 1200, metalWeight: 2.5 },
      { name: "Crown Bangle", category: "bangle", stlUrl: "", basePrice: 2800, metalWeight: 12.0 }
    ]);
  }
};

// Retrieve all CAD templates
export const getCadTemplates = async (req, res) => {
  try {
    await seedTemplatesIfEmpty();
    const templates = await CadTemplate.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error("Failed to load CAD templates:", error);
    res.status(500).json({ success: false, error: "Failed to load templates catalog." });
  }
};

// Retrieve material presets and gemstone configuration parameters
export const getPresets = async (req, res) => {
  try {
    await seedPresetsIfEmpty();
    const [materials, gemstones] = await Promise.all([
      MaterialPreset.find({}),
      GemstonePreset.find({})
    ]);
    res.json({
      success: true,
      data: { materials, gemstones }
    });
  } catch (error) {
    console.error("Failed to load config presets:", error);
    res.status(500).json({ success: false, error: "Failed to load configurator presets." });
  }
};

// Admin upload a new CAD template
export const uploadCadTemplate = async (req, res) => {
  try {
    const { name, category, basePrice, metalWeight, imageUrl } = req.body;
    
    let stlUrl = "";
    let fileType = "stl";

    // 1. Process primary visual model file (stlFile)
    // NOTE: .3dm is a Rhino production file and is NOT web-renderable.
    //       It must be uploaded in the 'productionFile' slot, not here.
    const WEB_RENDERABLE_EXTS = ["stl", "glb", "gltf", "obj"];

    if (req.files && req.files.stlFile && req.files.stlFile[0]) {
      const file = req.files.stlFile[0];
      const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
      if (!WEB_RENDERABLE_EXTS.includes(ext)) {
        return res.status(400).json({
          success: false,
          error: `'.${ext}' is not a web-renderable format. Use .stl, .glb, .gltf, or .obj for the visual preview. Upload .3dm files in the 'Production File' slot.`
        });
      }
      stlUrl = `/uploads/cad/${file.filename}`;
      fileType = ext;
    } else if (req.body.stlUrl) {
      stlUrl = req.body.stlUrl;
      const ext = path.extname(stlUrl).toLowerCase().replace(".", "");
      if (WEB_RENDERABLE_EXTS.includes(ext)) {
        fileType = ext;
      }
    } else {
      return res.status(400).json({ success: false, error: "A 3D visual preview file (.stl, .glb, .gltf, or .obj) is required. .3dm Rhino files should go in the Production File slot." });
    }

    // 2. Process additional files (production CAD files, specsheets, etc.)
    const additionalFilesData = [];

    // Master production CAD (.3dm) file
    if (req.files && req.files.productionFile && req.files.productionFile[0]) {
      const file = req.files.productionFile[0];
      const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
      additionalFilesData.push({
        role: "production",
        url: `/uploads/cad/${file.filename}`,
        fileType: ext,
        originalName: file.originalname
      });
    }

    // Other generic additional assets
    if (req.files && req.files.additionalFiles) {
      req.files.additionalFiles.forEach((file) => {
        const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
        additionalFilesData.push({
          role: "other",
          url: `/uploads/cad/${file.filename}`,
          fileType: ext,
          originalName: file.originalname
        });
      });
    }

    const template = await CadTemplate.create({
      name,
      category,
      stlUrl,
      fileType,
      imageUrl: imageUrl || "",
      basePrice: Number(basePrice) || 0,
      metalWeight: Number(metalWeight) || 0,
      additionalFiles: additionalFilesData,
      isActive: true
    });

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    console.error("Failed to upload CAD template:", error);
    res.status(500).json({ success: false, error: "Failed to register CAD template." });
  }
};

// Soft delete a CAD template
export const deleteCadTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await CadTemplate.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!template) {
      return res.status(404).json({ success: false, error: "Template not found" });
    }
    res.json({ success: true, message: "Template removed successfully." });
  } catch (error) {
    console.error("Failed to delete CAD template:", error);
    res.status(500).json({ success: false, error: "Failed to delete CAD template." });
  }
};
