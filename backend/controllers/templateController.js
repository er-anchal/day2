import TemplateCategory from "../models/TemplateCategory.js";
import { Template } from "../models/Template.js";
import fs from "fs";      
import path from "path";

export const getTemplateCategories = async (req, res) => {
  try {
    const categories = await TemplateCategory.find({ isActive: 0 }).sort({
      createdAt: -1,
    });
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

    // 1. Find category
    const category = await TemplateCategory.findOne({
      slug,
      isActive: 0,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // ========================================================
    // 👈 MAGIC AUTO-SYNC: Folder se videos read karke DB me daalna
    // ========================================================
    const videosBaseDir = path.resolve("uploads/videos");
    
    if (fs.existsSync(videosBaseDir)) {
      const subfolders = fs.readdirSync(videosBaseDir); 

      for (const folder of subfolders) {
        const folderPath = path.join(videosBaseDir, folder);
        
        if (fs.statSync(folderPath).isDirectory()) {
          const files = fs.readdirSync(folderPath);

          for (const file of files) {
            if (file.endsWith('.mp4')) {
              const existingTemplate = await Template.findOne({
                fileName: file,
                categoryId: category._id
              });

              if (!existingTemplate) {
                await Template.create({
                  categoryId: category._id,
                  subcategoryName: folder.charAt(0).toUpperCase() + folder.slice(1), 
                  fileName: file,
                  isActive: 0
                });
                console.log(`✅ Auto-Synced new video: ${file} in ${folder}`);
              }
            }
          }
        }
      }
    }
    // ========================================================

    // 2. Ab DB se saari templates fetch kar lo
    const templates = await Template.find({
      categoryId: category._id,
      isActive: 0,
    }).sort({ createdAt: -1 });

    // 3. Return ALL required fields
    const formattedTemplates = templates.map((t) => ({
      _id: t._id,
      fileName: t.fileName,
      categoryId: t.categoryId,
      categorySlug: category.slug,
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
    const userId = req.user._id; 

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    template.isActive = 1; 
    template.deletedBy = userId;
    template.deletedAt = new Date();

    await template.save();

    res.json({ message: "Template deleted successfully" });
  } catch (err) {
    console.error("Delete template error:", err);
    res.status(500).json({ message: "Failed to delete template" });
  }
};

export const streamVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template || !template.fileName) {
      return res.status(404).json({ message: "Video template not found" });
    }

    let fileName = template.fileName;
    if (!fileName.endsWith('.mp4')) {
      fileName += '.mp4';
    }

    const folderName = template.subcategoryName ? template.subcategoryName.toLowerCase() : "general";
    const videoPath = path.resolve(`uploads/videos/${folderName}/${fileName}`);

    if (!fs.existsSync(videoPath)) {
      console.error("File not found at path:", videoPath);
      return res.status(404).json({ message: `Video missing on server at: uploads/videos/${folderName}/${fileName}` });
    }

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