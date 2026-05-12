import mongoose from "mongoose";
import dotenv from "dotenv";
import { Template } from "./models/Template.js";
import TemplateCategory from "./models/TemplateCategory.js"; 
import SubCategory from "./models/SubCategory.js";

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding...");

    // 1. Find the Jewellery category
    const jewelleryCategory = await TemplateCategory.findOne({ slug: "jewellery" });
    if (!jewelleryCategory) {
       console.log("Error: 'jewellery' category not found. Make sure it is created in your Admin Panel.");
       process.exit(1);
    }

    // 2. Find all Subcategories
    const ringsSubCat = await SubCategory.findOne({ slug: "rings", categoryId: jewelleryCategory._id });
    const banglesSubCat = await SubCategory.findOne({ slug: "bangles", categoryId: jewelleryCategory._id }); 
    const pendantSubCat = await SubCategory.findOne({ slug: "necklaces", categoryId: jewelleryCategory._id }); 
    const articlesSubCat = await SubCategory.findOne({ slug: "clothing", categoryId: jewelleryCategory._id }); 

    // 3. Clear old templates to prevent duplicates
    await Template.deleteMany({});
    console.log("Cleared old templates.");

    // 4. The 16 Videos Array
    const defaultTemplates = [
      // ================= RINGS (4 Videos) =================
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: ringsSubCat?._id, subcategoryName: ringsSubCat?.name || "Rings", subcategorySlug: "rings",
        fileName: "ring-1.mp4", imageUrl: "/uploads/videos/rings/ring-1.mp4", name: "Classic Engagement Ring", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: ringsSubCat?._id, subcategoryName: ringsSubCat?.name || "Rings", subcategorySlug: "rings",
        fileName: "ring-2.mp4", imageUrl: "/uploads/videos/rings/ring-2.mp4", name: "Gold Wedding Band", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: ringsSubCat?._id, subcategoryName: ringsSubCat?.name || "Rings", subcategorySlug: "rings",
        fileName: "ring-3.mp4", imageUrl: "/uploads/videos/rings/ring-3.mp4", name: "Platinum Diamond Ring", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: ringsSubCat?._id, subcategoryName: ringsSubCat?.name || "Rings", subcategorySlug: "rings",
        fileName: "ring-4.mp4", imageUrl: "/uploads/videos/rings/ring-4.mp4", name: "Sapphire Halo Ring", isActive: 0,
      },

      // ================= BANGLES (4 Videos) =================
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: banglesSubCat?._id, subcategoryName: banglesSubCat?.name || "Bangles", subcategorySlug: "bangles",
        fileName: "bangle-1.mp4", imageUrl: "/uploads/videos/bangles/bangle-1.mp4", name: "24k Gold Bangle", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: banglesSubCat?._id, subcategoryName: banglesSubCat?.name || "Bangles", subcategorySlug: "bangles",
        fileName: "bangle-2.mp4", imageUrl: "/uploads/videos/bangles/bangle-2.mp4", name: "Diamond Studded Bangle", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: banglesSubCat?._id, subcategoryName: banglesSubCat?.name || "Bangles", subcategorySlug: "bangles",
        fileName: "bangle-3.mp4", imageUrl: "/uploads/videos/bangles/bangle-3.mp4", name: "Antique Style Bangle", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: banglesSubCat?._id, subcategoryName: banglesSubCat?.name || "Bangles", subcategorySlug: "bangles",
        fileName: "bangle-4.mp4", imageUrl: "/uploads/videos/bangles/bangle-4.mp4", name: "Modern Platinum Bangle", isActive: 0,
      },

      // ================= PENDANTS (4 Videos) =================
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: pendantSubCat?._id, subcategoryName: pendantSubCat?.name || "Pendant", subcategorySlug: "necklaces",
        fileName: "pendant-1.mp4", imageUrl: "/uploads/videos/pendant/pendant-1.mp4", name: "Heart Shaped Pendant", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: pendantSubCat?._id, subcategoryName: pendantSubCat?.name || "Pendant", subcategorySlug: "necklaces",
        fileName: "pendant-2.mp4", imageUrl: "/uploads/videos/pendant/pendant-2.mp4", name: "Emerald Drop Pendant", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: pendantSubCat?._id, subcategoryName: pendantSubCat?.name || "Pendant", subcategorySlug: "necklaces",
        fileName: "pendant-3.mp4", imageUrl: "/uploads/videos/pendant/pendant-3.mp4", name: "Simple Gold Cross", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: pendantSubCat?._id, subcategoryName: pendantSubCat?.name || "Pendant", subcategorySlug: "necklaces",
        fileName: "pendant-4.mp4", imageUrl: "/uploads/videos/pendant/pendant-4.mp4", name: "Pearl Pendant Necklace", isActive: 0,
      },

      // ================= ARTICLES (4 Videos) =================
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: articlesSubCat?._id, subcategoryName: articlesSubCat?.name || "Articles", subcategorySlug: "clothing",
        fileName: "article-1.mp4", imageUrl: "/uploads/videos/articles/article-1.mp4", name: "Bridal Jewellery Set", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: articlesSubCat?._id, subcategoryName: articlesSubCat?.name || "Articles", subcategorySlug: "clothing",
        fileName: "article-2.mp4", imageUrl: "/uploads/videos/articles/article-2.mp4", name: "Kundan Choker Set", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: articlesSubCat?._id, subcategoryName: articlesSubCat?.name || "Articles", subcategorySlug: "clothing",
        fileName: "article-3.mp4", imageUrl: "/uploads/videos/articles/article-3.mp4", name: "Temple Jewellery Set", isActive: 0,
      },
      {
        categoryId: jewelleryCategory._id, categoryName: jewelleryCategory.name, categorySlug: jewelleryCategory.slug,
        subcategoryId: articlesSubCat?._id, subcategoryName: articlesSubCat?.name || "Articles", subcategorySlug: "clothing",
        fileName: "article-4.mp4", imageUrl: "/uploads/videos/articles/article-4.mp4", name: "Polki Necklace Set", isActive: 0,
      }
    ];

    // Filter out any templates where the subcategory wasn't found in your DB
    const validTemplates = defaultTemplates.filter(t => t.subcategoryId);
    
    // Insert all 16 videos
    await Template.insertMany(validTemplates);
    
    console.log(`✅ ${validTemplates.length} Templates seeded successfully!`);
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDB();