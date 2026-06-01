import { Template } from "../models/Template.js";
import { TemplateShot } from "../models/TemplateShot.js";
import TemplateCategory from "../models/TemplateCategory.js";
import SubCategory from "../models/SubCategory.js";
import path from "path";

// Create template with optional shots
// Replace only the createTemplate() function with this version

export const createTemplate = async (req, res) => {
  try {
    // console.log("BODY:", req.body);
    // console.log("FILES:", req.files);

    const templateImages = req.files?.images || [];
    const shotImages = req.files?.shots || [];

    if (templateImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one template image is required",
      });
    }

    const { categoryId, subCategoryId } = req.body;

    if (!categoryId || !subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId and subCategoryId are required",
      });
    }

    // Find category
    const category = await TemplateCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Find subcategory
    const subcategory = await SubCategory.findById(subCategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    const createdTemplates = [];
    // Use path module

    // Helper function
    const cleanFileName = (filename) => {
      // Example input:
      // Necklace1-1778649624865.png

      const ext = path.extname(filename); // .png
      const baseName = path.basename(filename, ext); // Necklace1-1778649624865

      // Remove timestamp suffix (-13 or more digits)
      const cleanedBaseName = baseName.replace(/-\d{13}$/, "");

      // Return Necklace1.png
      return cleanedBaseName + ext;
    };

    // Test:
    console.log(cleanFileName("Necklace1-1778649624865.png"));
    // Output: Necklace1.png

    for (const file of templateImages) {
      const cleanTemplateFileName = cleanFileName(file.originalname);

      const template = await Template.create({
        categoryId: category._id,
        categoryName: category.name,
        categorySlug: category.slug,

        subcategoryId: subcategory._id,
        subcategoryName: subcategory.name,
        subcategorySlug: subcategory.slug,

        // Saved as Necklace1.png
        fileName: cleanTemplateFileName,

        // Keep actual stored path with timestamped filename
        imageUrl: `/uploads/${category.slug}/${subcategory.slug}/${file.originalname}`,

        createdBy: req.user?._id,

        shots: shotImages.map(
          (shot) =>
            `/uploads/${category.slug}/${subcategory.slug}/shots/${shot.originalname}`,
        ),
      });

      // Save shot documents
      for (const shot of shotImages) {
        await TemplateShot.create({
          templateId: template._id,

          categoryId: category._id,
          categoryName: category.name,
          categorySlug: category.slug,

          subcategoryId: subcategory._id,
          subcategoryName: subcategory.name,
          subcategorySlug: subcategory.slug,

          // Saved as necklace2.png
          fileName: cleanFileName(shot.originalname),

          imageUrl: `/uploads/${category.slug}/${subcategory.slug}/shots/${shot.originalname}`,

          createdBy: req.user?._id,
        });
      }

      createdTemplates.push(template);
    }
    return res.status(201).json({
      success: true,
      message: "Templates uploaded successfully",
      count: createdTemplates.length,
      shotCount: shotImages.length,
      templates: createdTemplates,
    });
  } catch (error) {
    console.error("Create template error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
};

// Get all templates
export const getTemplates = async (req, res) => {
  try {
    const { category, subcategory } = req.query;

    const filter = {};

    if (category) filter.categorySlug = category;
    if (subcategory) filter.subcategorySlug = subcategory;

    const templates = await Template.find(filter).sort({
      createdAt: -1,
    });

    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get templates by category slug
export const getTemplatesByCategory = async (req, res) => {
  try {
    const templates = await Template.find({
      categorySlug: req.params.slug,
    });

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
