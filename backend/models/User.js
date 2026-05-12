import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    // ───────────── Basic Info ─────────────
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"],
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // security best practice
    },

    avatar: {
      type: String, // profile image URL
      default: "",
    },

    // ───────────── Role & Status ─────────────
    role: {
      type: String,
      enum: ["SUPER ADMIN", "ADMIN", "USER"],
      default: "USER",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ───────────── Subscription ─────────────
    plan: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"],
      default: "FREE",
    },

    planExpiry: {
      type: Date,
      default: null,
    },

    // ───────────── Image Usage Tracking ─────────────
    usage: {
      imagesEdited: {
        type: Number,
        default: 0,
      },
      imagesUploaded: {
        type: Number,
        default: 0,
      },
      storageUsedMB: {
        type: Number,
        default: 0,
      },
    },

    // ───────────── Editor Preferences ─────────────
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      defaultFormat: {
        type: String,
        enum: ["png", "jpg", "webp"],
        default: "png",
      },
      autoSave: {
        type: Boolean,
        default: true,
      },
    },

    // ───────────── Auth Metadata ─────────────
    lastLoginAt: {
      type: Date,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    // ───────────── OAuth (Optional) ─────────────
    provider: {
      type: String,
      enum: ["LOCAL", "GOOGLE", "GITHUB"],
      default: "LOCAL",
    },

    providerId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// ───────────── Password Hashing ─────────────
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ───────────── Password Compare ─────────────
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", UserSchema);
