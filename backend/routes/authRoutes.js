import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserById,
  toggleUserStatus,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);
router.get("/users", authMiddleware, getAllUsers);
router.put("/users/:id", updateUserById);
router.put("/users/:id/status", toggleUserStatus);
export default router;
