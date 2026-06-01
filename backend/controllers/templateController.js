import TemplateCategory from "../models/TemplateCategory.js";
import { Template } from "../models/Template.js";
import fs from "fs";
import path from "path";

export const getDiskTemplates = async (req, res) => {
  try {
    const folders = ["rings", "pendants", "bangles", "articles"];
    const subcategoryNameMap = {
      rings: "Rings",
      pendants: "Pendants",
      bangles: "Bangles",
      articles: "Articles"
    };

    let allTemplates = [];

    for (const folder of folders) {
      const folderPath = path.resolve("uploads/videos", folder);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          if (file.endsWith(".mp4")) {
            allTemplates.push({
              _id: `${folder}-${file}`,
              fileName: file,
              categorySlug: "jewellery",
              categoryName: "Jewellery",
              subcategoryName: subcategoryNameMap[folder] || folder,
              subcategorySlug: folder,
              videoUrl: `${process.env.API_URL || "http://localhost:5001"}/uploads/videos/${folder}/${file}`
            });
          }
        }
      }
    }

    res.json(allTemplates);
  } catch (error) {
    console.error("Failed to read disk templates:", error);
    res.status(500).json({ message: "Failed to read disk templates" });
  }
};

export const getTemplateCategories = async (req, res) => {
  try {
    const categories = await TemplateCategory.find({ isActive: 0 }).sort({
      createdAt: -1,
    });
    // console.log(categories);
    return res.json(categories);
  } catch (error) {
    console.error(error);
    const errMsg = error.message || "Server Error";
    return res.status(500).json({ message: errMsg });
  }
};
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    res.json(template);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to load template",
    });
  }
};

export const getTemplatesByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find category
    const category = await TemplateCategory.findOne({
      slug,
      isActive: 0,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Fetch templates
    const templates = await Template.find({
      categoryId: category._id,
      isActive: 0,
    }).sort({ createdAt: -1 });

    // Return ALL required fields including subcategory data
    const formattedTemplates = templates.map((t) => ({
      _id: t._id,
      fileName: t.fileName,
      categoryId: t.categoryId,
      categorySlug: category.slug,

      // IMPORTANT: include subcategory fields
      subcategoryId: t.subcategoryId,
      subcategoryName: t.subcategoryName,

      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    res.json(formattedTemplates);
  } catch (err) {
    console.error("Failed to fetch templates:", err);
    res.status(500).json({
      message: "Failed to fetch templates",
    });
  }
};
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // assuming authMiddleware sets req.user

    // Find the template
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Soft delete: mark as inactive
    template.isActive = 1; // or true if you change to boolean
    template.deletedBy = userId;
    template.deletedAt = new Date();

    await template.save();

    // Optionally, you could also remove the file from disk here

    res.json({ message: "Template deleted successfully" });
  } catch (err) {
    console.error("Delete template error:", err);
    res.status(500).json({ message: "Failed to delete template" });
  }
};
