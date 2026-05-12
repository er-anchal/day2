import TemplateSubCategory from "../models/SubCategory.js";
import fs from "fs";
import path from "path";
import { Template } from "../models/Template.js";
import TemplateCategory from "../models/TemplateCategory.js";
import slugify from "slugify";

export const createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ message: "All fields required" });
    }

    const category = await TemplateCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const slug = slugify(name, { lower: true, strict: true });

    const exists = await TemplateSubCategory.findOne({
      name: name,
      categoryId,
      isActive: 0,
    });

    if (exists) {
      return res.status(409).json({ message: "Already exists" });
    }

    const subCategory = await TemplateSubCategory.create({
      name,
      slug,
      categoryId,
      categoryName: category.name,
      createdBy: req.user?._id, // ✅ IMPORTANT FIX
    });

    res.status(201).json(subCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* GET ALL */
export const getSubCategories = async (req, res) => {
  try {
    const data = await TemplateSubCategory.find({ isActive: 0 }).sort({
      createdAt: -1,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET BY CATEGORY */
export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const data = await TemplateSubCategory.find({
      categoryId,
      isActive: 0,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const TEMP_UPLOAD_PATH = path.join(process.cwd(), "uploads");

export const uploadSubCategoryImages = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.body;

    if (!categoryId || !subCategoryId) {
      return res.status(400).json({
        message: "Category ID and SubCategory ID are required",
      });
    }

    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // 🔹 Validate category
    const category = await TemplateCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 🔹 Validate subcategory
    const subCategory = await TemplateSubCategory.findById(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    // 🔹 Create folder: uploads/category/subcategory
    const folderPath = path.join(
      TEMP_UPLOAD_PATH,
      category.slug,
      subCategory.slug,
    );

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const savedTemplates = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);

      const fileName = `${baseName}-${Date.now()}${ext}`;
      const dest = path.join(folderPath, fileName);

      // ⚠️ IMPORTANT: multer must use memoryStorage()
      if (!file.buffer) {
        return res.status(500).json({
          message: "File buffer missing. Check multer memoryStorage setup.",
        });
      }

      fs.writeFileSync(dest, file.buffer);
      const imageUrl = `/uploads/${category.slug}/${subCategory.slug}/${fileName}`;
      // 🔹 Save in DB
      const template = await Template.create({
        categoryId: category._id,
        categoryName: category.name,
        categorySlug: category.slug,

        subcategoryId: subCategory._id,
        subcategoryName: subCategory.name,
        subcategorySlug: subCategory.slug,

        imageUrl,
        fileName,
        createdBy: req.user?._id,
      });
      savedTemplates.push(template);
    }

    return res.status(201).json({
      message: "SubCategory images uploaded successfully",
      templates: savedTemplates,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};
/* UPDATE */
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const slug = slugify(name, { lower: true, strict: true });

    const updated = await TemplateSubCategory.findByIdAndUpdate(
      id,
      { name, slug, updatedBy: req.user?._id },
      { new: true },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE */
export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await TemplateSubCategory.findByIdAndUpdate(id, {
      isActive: 1,
      deletedAt: new Date(),
      deletedBy: req.user?._id,
    });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
