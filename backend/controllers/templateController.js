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
    const { slug } = req.params; // slug aayega 'jewellery'

    // 1. AUTO-CREATE CATEGORY: 404 Error hatane ke liye DB me 'jewellery' bana lo
    let category = await TemplateCategory.findOne({ slug, isActive: 0 });
    if (!category) {
      category = await TemplateCategory.create({
        name: slug.charAt(0).toUpperCase() + slug.slice(1), // "Jewellery"
        slug: slug,
        isActive: 0,
      });
      console.log(`✅ Auto-Created Category: ${slug}`);
    }

    // 2. FOLDER READ LOGIC: Tumhare 'backend/upload/' folder ko target karega
    const baseDir = path.resolve("upload"); // 👈 Yahan path 'upload' kar diya hai

    if (fs.existsSync(baseDir)) {
      const subfolders = fs.readdirSync(baseDir); // Ye tumhara 'rings' folder dhundhega

      for (const folder of subfolders) {
        const folderPath = path.join(baseDir, folder);

        if (fs.statSync(folderPath).isDirectory()) {
          const files = fs.readdirSync(folderPath); // Ye 'ring-1.mp4' dhundhega

          for (const file of files) {
            if (file.endsWith(".mp4")) {
              const existingTemplate = await Template.findOne({
                fileName: file,
                categoryId: category._id,
              });

              if (!existingTemplate) {
                // Folder 'rings' ban jayega Subcategory 'Rings'
                await Template.create({
                  categoryId: category._id,
                  subcategoryName:
                    folder.charAt(0).toUpperCase() + folder.slice(1),
                  fileName: file,
                  isActive: 0,
                });
                console.log(`✅ Auto-Synced: ${file} from folder: ${folder}`);
              }
            }
          }
        }
      }
    }

    // 3. FETCH AND SEND TO FRONTEND
    const templates = await Template.find({
      categoryId: category._id,
      isActive: 0,
    }).sort({ createdAt: -1 });

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
    res.status(500).json({ message: "Failed to fetch templates" });
  }
};

// ========================================================

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
    if (!fileName.endsWith(".mp4")) {
      fileName += ".mp4";
    }

    // Ye 'Rings' ko lowercase 'rings' me badal dega jo tumhara folder name hai
    const folderName = template.subcategoryName
      ? template.subcategoryName.toLowerCase()
      : "general";

    // 👈 IMPORTANT: Pehle yahan 'uploads/videos' tha, ab 'upload' kar diya hai
    const videoPath = path.resolve(`upload/${folderName}/${fileName}`);

    if (!fs.existsSync(videoPath)) {
      console.error("File not found at path:", videoPath);
      return res.status(404).json({ message: "Video missing on server" });
    }

    // ... baaki pura range/streaming code waisa hi rahega jaisa tumhara pehle tha
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
