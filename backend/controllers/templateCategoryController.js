import TemplateCategory from "../models/TemplateCategory.js";
import slugify from "slugify";
import fs from "fs";
import path from "path";
import { Template } from "../models/Template.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // 🔹 Generate slug
    const slug = slugify(name, { lower: true, strict: true });

    // 🔹 Check if category already exists
    const exists = await TemplateCategory.findOne({ slug });
    if (exists) {
      return res.status(409).json({ message: "Category already exists" });
    }

    // console.log(name, slug);

    // return res.json({ success: true });
    // 🔹 Save category to DB
    const category = await TemplateCategory.create({ name, slug });

    // 🔹 Create uploads/category-slug folder
    const uploadPath = path.join(process.cwd(), "uploads", slug);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Server error" });
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

/* ---------------- UPDATE ---------------- */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await TemplateCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const newSlug = slugify(name, { lower: true, strict: true });

    // Prevent duplicate
    const exists = await TemplateCategory.findOne({
      slug: newSlug,
      _id: { $ne: id },
    });
    if (exists) {
      return res.status(409).json({ message: "Category already exists" });
    }

    // Rename folder if slug changed
    if (category.slug !== newSlug) {
      const oldPath = path.join(process.cwd(), "uploads", category.slug);
      const newPath = path.join(process.cwd(), "uploads", newSlug);

      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }
    }

    category.name = name;
    category.slug = newSlug;
    await category.save();

    res.json({ category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- DELETE ---------------- */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await TemplateCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // const folderPath = path.join(process.cwd(), "uploads", category.slug);

    // // Delete folder recursively
    // if (fs.existsSync(folderPath)) {
    //   fs.rmSync(folderPath, { recursive: true, force: true });
    // }

    await TemplateCategory.findByIdAndUpdate(id, {
      isActive: 1,
      deletedAt: new Date(),
    });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const TEMP_UPLOAD_PATH = path.join(process.cwd(), "uploads");

// Upload images and save to Templates collection
export const uploadCategoryImages = async (req, res) => {
  try {
    const { categoryId } = req.body; // send categoryId instead of slug
    if (!categoryId)
      return res.status(400).json({ message: "Category ID is required" });

    if (!req.files || !req.files.length)
      return res.status(400).json({ message: "No files uploaded" });

    // Find category
    const category = await TemplateCategory.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const folderPath = path.join(TEMP_UPLOAD_PATH, category.slug);
    if (!fs.existsSync(folderPath))
      fs.mkdirSync(folderPath, { recursive: true });

    // Save each file
    const savedTemplates = [];
    for (const file of req.files) {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);

      // ✅ unique filename
      const fileName = `${baseName}-${Date.now()}${ext}`;
      const dest = path.join(folderPath, fileName);

      fs.writeFileSync(dest, file.buffer);

      // 🔹 Save in DB
      const template = await Template.create({
        categoryId: category._id,
        fileName,
        createdBy: req.user?._id,
      });

      savedTemplates.push(template);
    }

    return res.status(201).json({
      message: "Images uploaded and saved to DB successfully",
      templates: savedTemplates,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const getLandingCategory = async (req, res) => {
  try {
    const categories = await TemplateCategory.find({ isActive: 0 })
      .sort({ createdAt: -1 })
      .lean();

    const data = await Promise.all(
      categories.map(async (cat) => {
        const templates = await Template.find({
          categoryId: cat._id,
        })
          .sort({ createdAt: -1 })
          .limit(6)
          .lean();

        return {
          category: cat,
          templates,
        };
      }),
    );

    return res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
