import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Notification from "../models/Notification.js";
import Pricing from "../models/Pricing.js";
export const checkAndCreateBirthdayNotification = async (userId, dob) => {
  if (!dob) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dobDate = new Date(dob);
  // Revert to local time extraction - Mongoose saves it as Local Midnight, so UTC shifts it back by 1 day!
  const birthMonth = dobDate.getMonth();
  const birthDay = dobDate.getDate();

  // Build this year's birthday date
  let birthday = new Date(today.getFullYear(), birthMonth, birthDay);
  birthday.setHours(0, 0, 0, 0);

  // If already passed this year, shift to next year
  if (birthday < today) {
    birthday = new Date(today.getFullYear() + 1, birthMonth, birthDay);
    birthday.setHours(0, 0, 0, 0);
  }

  const diffDays = Math.round(
    (birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Only notify within the 3-day window (diffDays 0 = birthday itself)
  if (diffDays < 0 || diffDays > 3) return;

  const expectedMessage =
    diffDays === 0
      ? "🎂 Happy Birthday! Wishing you an amazing day!"
      : `🎉 Your birthday is coming up in ${diffDays} day(s)! Get ready to celebrate!`;

  // Dedup: ensure THIS EXACT message only comes ONCE this year.
  // This allows a countdown (3 days, 2 days, etc) but prevents duplicates of the same message.
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  const existingNotif = await Notification.findOne({
    userId,
    type: "BIRTHDAY",
    message: expectedMessage,
    createdAt: { $gte: startOfYear },
  });

  if (!existingNotif) {
    await Notification.create({
      userId,
      type: "BIRTHDAY",
      message: expectedMessage,
    });
  }
};
// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    let {
      name,
      companyName,
      designation,
      phone,
      alternatePhone,
      email,
      address,
      city,
      state,
      country,
      pincode,
      gstNumber,
      panNumber,
      industry,
      password,
      role,
      dob,
    } = req.body;

    // Required validation
    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, email and password are required",
      });
    }

    role = role?.trim().toUpperCase() || "USER";

    const allowedRoles = ["SUPER ADMIN", "ADMIN", "USER", "CLIENT"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Validate DOB year (must be strictly less than current year)
    if (dob) {
      const dobYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      if (dobYear >= currentYear) {
        return res.status(400).json({
          success: false,
          message: `Birth year must be less than ${currentYear}.`,
        });
      }
    }
    // Duplicate checks
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // Create user
    const user = await User.create({
      name,
      companyName,
      designation,
      phone,
      alternatePhone,
      email,
      address,
      city,
      state,
      country: country || "India",
      pincode,
      gstNumber,
      panNumber,
      industry,
      password,
      role,
      dob,
    });

    const pricingData = await Pricing.create({
      userId: user._id,
      name: user.name,
      planName: "FREE",
      type: "free",
      imageCredits: { allocated: 100, used: 0 },
      videoCredits: { allocated: 5, used: 0 },
      isActive: 0,
    });
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
      pricing: {
        planName: pricingData.planName,
        imageCredits: pricingData.imageCredits,
        videoCredits: pricingData.videoCredits,
        isActive: pricingData.isActive,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    // console.log("Login Request:", req.body);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email }).select("+password");

    // console.log("User Found:", user ? user.email : "No user found");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // console.log("Entered Password:", password);
    // console.log("Stored Hash:", user.password);

    const isMatch = await user.comparePassword(password);

    // console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4️⃣ Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // 🌟 System Login Notification Logic
    const time = new Date().toLocaleString();
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
    const locationStr =
      ip === "::1" || ip === "127.0.0.1" ? "localhost" : `IP: ${ip}`;

    await Notification.create({
      userId: user._id,
      type: "SYSTEM",
      message: `New login to your account at ${time} from ${locationStr}`,
    });

    // 🌟 Birthday Notification Logic
    if (user.dob) {
      await checkAndCreateBirthdayNotification(user._id, user.dob);
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// GET /api/auth/me
export const getProfile = async (req, res) => {
  try {
    const userData = req.user;

    const user = await User.findById(userData._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        dob: user.dob,
        plan: user.plan,
        preferences: user.preferences,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PUT /api/auth/me
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, phone, email, dob } = req.body;

    //  ALLOWED FIELDS ONLY
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (dob) updates.dob = dob;

    /* ---------------- DOB VALIDATION ---------------- */
    if (dob) {
      const dobYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      if (dobYear >= currentYear) {
        return res.status(400).json({
          success: false,
          message: `Birth year must be less than ${currentYear}.`,
        });
      }
    }

    // //  PHONE VALIDATION
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    //  PHONE DUPLICATE CHECK
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: user._id },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number already in use",
        });
      }
    }

    //  EMAIL DUPLICATE CHECK
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    //  APPLY UPDATES SAFELY
    Object.assign(user, updates);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        dob: user.dob,
        avatar: user.avatar,
        plan: user.plan,
        preferences: user.preferences,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: 0 })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "name",
      "companyName",
      "designation",
      "phone",
      "alternatePhone",
      "email",
      "address",
      "city",
      "state",
      "country",
      "pincode",
      "gstNumber",
      "panNumber",
      "industry",
      "role",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Duplicate email check
    if (updates.email && updates.email !== user.email) {
      const existingEmail = await User.findOne({
        email: updates.email,
        _id: { $ne: id },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Duplicate phone check
    if (updates.phone && updates.phone !== user.phone) {
      const existingPhone = await User.findOne({
        phone: updates.phone,
        _id: { $ne: id },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone already in use",
        });
      }
    }

    Object.assign(user, updates);
    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = Number(isActive);
    await user.save();

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    console.error("Toggle Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
