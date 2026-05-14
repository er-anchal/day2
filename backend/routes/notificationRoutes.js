import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  checkBirthday,
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.post("/check-birthday", checkBirthday);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
