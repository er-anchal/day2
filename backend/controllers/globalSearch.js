import { Template } from "../models/Template.js";
import TemplateSubCategory from "../models/SubCategory.js";

/**
 * Global Search Controller
 * Searches active templates and subcategories based on query parameter 'q'.
 * Accessible by both logged-in and guest users.
 */
export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.json({
        success: true,
        subcategories: [],
        templates: [],
      });
    }

    const searchQuery = q.trim();
    const regex = new RegExp(searchQuery, "i");

    // Search active templates (isActive = 0)
    const templates = await Template.find({
      isActive: 0,
      $or: [
        { name: regex },
        { fileName: regex },
        { subcategoryName: regex },
        { categoryName: regex },
      ],
    }).sort({ createdAt: -1 });

    // Search active subcategories (isActive = 0)
    const subcategories = await TemplateSubCategory.find({
      isActive: 0,
      $or: [
        { name: regex },
        { categoryName: regex },
      ],
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      subcategories,
      templates,
    });
  } catch (error) {
    console.error("Global search error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to perform global search",
    });
  }
};
