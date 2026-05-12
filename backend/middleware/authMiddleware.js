import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }
  next();
};
