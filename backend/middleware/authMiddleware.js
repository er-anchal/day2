import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RoleAccess from "../models/roleAccess.js";
import Module from "../models/Module.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let errMsg;
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verification error:", err.message);
      errMsg =
        err.message === "jwt expired"
          ? "Token expired! Login again."
          : "Invalid token! Login again. ";
      return res.status(401).json({ success: false, message: errMsg });
    }

    const user = await User.findById(decoded.userId);
    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    req.user = user; // attach user object
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    const userRole = req.user.role;

    // SUPER ADMIN always has full access to everything to prevent lockouts
    if (userRole === "SUPER ADMIN") {
      return next();
    }

    // Determine target module route path by inspecting request URL
    let modulePath = "";
    const originalUrl = req.originalUrl.toLowerCase();

    if (originalUrl.startsWith("/api/template-categories")) {
      modulePath = "/categories";
    } else if (originalUrl.startsWith("/api/template-subcategories")) {
      modulePath = "/subcategories";
    } else if (originalUrl.startsWith("/api/templates") || originalUrl.startsWith("/api/template-shots")) {
      modulePath = "/templates";
    } else if (originalUrl.startsWith("/api/user-queries")) {
      modulePath = "/admin/queries";
    } else if (originalUrl.startsWith("/api/faqs")) {
      modulePath = "/admin/faqs";
    } else if (originalUrl.startsWith("/api/subscription-plans")) {
      modulePath = "/admin/pricing";
    } else if (originalUrl.startsWith("/api/role-access") || originalUrl.startsWith("/api/modules")) {
      modulePath = "/roleaccess";
    } else {
      // Default to allow if it's not a standard administrative module path
      return next();
    }

    // Find the corresponding module name from the Modules database
    const targetModule = await Module.findOne({
      path: { $regex: new RegExp(`^${modulePath}$`, "i") },
    });

    if (!targetModule) {
      // If the module itself is not defined/seeded, allow bypass to prevent breaking unregistered APIs
      return next();
    }

    const moduleName = targetModule.name;

    // Fetch permissions allocation matrix for user's role
    const roleAccess = await RoleAccess.findOne({ roleName: userRole });
    if (!roleAccess) {
      return res.status(403).json({
        success: false,
        message: `Access denied. No permissions defined for role: ${userRole}`,
      });
    }

    // Find matching module permission
    const accessItem = roleAccess.moduleAccess.find(
      (item) => item.moduleName.toLowerCase().trim() === moduleName.toLowerCase().trim()
    );

    if (!accessItem || !accessItem.permissions?.view) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You do not have permission to view or manage the '${moduleName}' module.`,
      });
    }

    next();
  } catch (error) {
    console.error("RBAC Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authorization check.",
    });
  }
};

