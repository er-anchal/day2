import TemplateCategory from "../models/TemplateCategory.js";
import { Template } from "../models/Template.js";
import fs from "fs";      
import path from "path";

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
// ==========================================
// 👈 NAYA CONTROLLER: VIDEO STREAM KARNE KE LIYE
// ==========================================
export const streamVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template || !template.fileName) {
      return res.status(404).json({ message: "Video template not found" });
    }

    // 1. Agar aapne DB me sirf "ring-1" save kiya hai, toh .mp4 khud lag jayega
    let fileName = template.fileName;
    if (!fileName.endsWith('.mp4')) {
      fileName += '.mp4';
    }

    // 2. Subcategory ka folder name (e.g., "rings") dynamically lene ke liye
    // Agar kisi template me subcategory nahi hai, toh wo 'general' folder dhoondega
    const folderName = template.subcategoryName ? template.subcategoryName.toLowerCase() : "general";

    // 3. Exact path banana: uploads/videos/rings/ring-1.mp4
    const videoPath = path.resolve(`uploads/videos/${folderName}/${fileName}`);

    // Check karna ki server par sach me file wahan hai ya nahi
    if (!fs.existsSync(videoPath)) {
      console.error("File not found at path:", videoPath);
      return res.status(404).json({ message: `Video missing on server at: uploads/videos/${folderName}/${fileName}` });
    }

    // Video Streaming Logic (Chunks me bhejna)
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    console.error("Video stream error:", err);
    res.status(500).json({ message: "Failed to play video" });
  }
};