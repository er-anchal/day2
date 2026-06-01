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
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    designation: {
      type: String,
      trim: true,
      default: "",
    },
    industry: {
      type: String,
      enum: [
        "",
        "JEWELLERY",
        "FASHION",
        "REAL ESTATE",
        "EDUCATION",
        "HEALTHCARE",
      ],
      default: "",
    },

    dob: {
      type: Date,
      default: null,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"],
      index: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: "",
      match: [/^$|^[0-9]{10}$/, "Alternate phone must be 10 digits"],
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

    // ───────────── Address Info  ─────────────
    address: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "India",
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },
    // ───────────── Business Details ─────────────
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    // ───────────── Role & Status ─────────────
    role: {
      type: String,
      enum: ["SUPER ADMIN", "ADMIN", "USER", "CLIENT"],
      default: "",
    },

    isActive: {
      type: String,
      default: 0, // 0 = active, 1 = deleted/inactive
      index: true,
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
