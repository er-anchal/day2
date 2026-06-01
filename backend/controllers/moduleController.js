import Module from "../models/Module.js";

export const createModule = async (req, res) => {
  try {
    const { name, path, icon = "", description = "", sortOrder = 0 } = req.body;

    // Validate required fields
    if (!name || !path) {
      return res.status(400).json({
        success: false,
        message: "Name and Path are required",
      });
    }

    // Check duplicate name
    const existingName = await Module.findOne({ name: name.trim() });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Module name already exists",
      });
    }

    // Check duplicate path
    const existingPath = await Module.findOne({ path: path.trim() });
    if (existingPath) {
      return res.status(400).json({
        success: false,
        message: "Module path already exists",
      });
    }

    const module = await Module.create({
      name: name.trim(),
      path: path.trim(),
      icon,
      description,
      sortOrder: Number(sortOrder) || 0,
      createdByName: "system",
    });

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: module,
    });
  } catch (error) {
    console.error("Create Module Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getModules = async (req, res) => {
  try {
    const modules = await Module.find({}).lean();

    // console.log("RAW DATA:", modules);

    res.json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE MODULE
export const updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        modifiedAt: new Date(),
        modifiedOn: new Date().toLocaleString(),
      },
      { new: true, runValidators: true },
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.json({
      success: true,
      message: "Module updated successfully",
      data: module,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE MODULE (SOFT DELETE)
export const deleteModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        modifiedAt: new Date(),
        modifiedOn: new Date().toLocaleString(),
      },
      { new: true },
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
