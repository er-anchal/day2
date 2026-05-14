import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { checkAndCreateBirthdayNotification } from "./authController.js";

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /api/notifications/check-birthday
export const checkBirthday = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.dob) {
      return res.status(200).json({ success: true, message: "No DOB set" });
    }

    await checkAndCreateBirthdayNotification(user._id, user.dob);

    res.status(200).json({ success: true, message: "Birthday check done" });
  } catch (error) {
    console.error("Check Birthday Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
