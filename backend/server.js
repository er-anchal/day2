// Force nodemon restart to apply .env key updates
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();

import path from "path";
import uploadRoutes from "./routes/uploadRoute.js";

import authRoutes from "./routes/authRoutes.js";

import templateRoutes from "./routes/templateRoutes.js";
import templateCategoryRoutes from "./routes/templateCategoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import templateShotRoutes from "./routes/templateShotRoutes.js";
import { globalSearch } from "./controllers/globalSearch.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import subscriptionPlanRoutes from "./routes/subscriptionPlanRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import userQueryRoutes from "./routes/userQueryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import enhancerRoutes from "./routes/enhancerRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import roleAccessRoutes from "./routes/roleAccessRoutes.js";
import trendyRoutes from "./routes/trendyRoutes.js";
import jewelleryRoutes from "./routes/jewelleryRoutes.js";
import chatbotRoutes from "./routes/chatbotRoute.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import cadRoutes from "./routes/cadRoutes.js";


const app = express();
app.use(cors());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);
connectDB();
app.use("/api/pricing", pricingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/templates", templateRoutes);
app.get("/api/search", globalSearch);
app.use("/api/template-categories", templateCategoryRoutes);
app.use("/api/template-subcategories", subCategoryRoutes);
app.use("/api/template-shots", templateShotRoutes);
app.use("/api/subscription-plans", subscriptionPlanRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/user-queries", userQueryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/enhance", enhancerRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/role-access", roleAccessRoutes);
app.use("/api/trendy", trendyRoutes);
app.use("/api/jewellery", jewelleryRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/cad", cadRoutes);


app.get("/", (req, res) => {
  res.send("Banner App Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
