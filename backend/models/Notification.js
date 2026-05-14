import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["BIRTHDAY", "SYSTEM", "INFO"],
      default: "INFO",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", NotificationSchema);
