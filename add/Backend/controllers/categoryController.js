import TemplateCategory from "../models/TemplateCategory";

export const fetchBirthdayTemplates = async (req, res) => {
  try {
    console.log("Fetch Birthday Templates");
  } catch (error) {
    console.log("Fetch Birthday Temp Err", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

const TEMP_UPLOAD_PATH = path.join(process.cwd(), "uploads"); // adjust if needed

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await TemplateCategory.find({}, "name slug").sort({
      name: 1,
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// Get images for a category by slug
export const getCategoryImages = async (req, res) => {
  const { slug } = req.params;
  try {
    const folderPath = path.join(TEMP_UPLOAD_PATH, slug);

    if (!fs.existsSync(folderPath)) {
      return res.json([]); // return empty array if folder doesn't exist
    }

    const files = fs.readdirSync(folderPath).filter((file) => {
      // Optional: filter only images
      return /\.(jpe?g|png|gif|webp)$/i.test(file);
    });

    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch images" });
  }
};
