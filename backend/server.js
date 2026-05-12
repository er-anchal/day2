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
import pricingRoutes from "./routes/pricingRoutes.js";

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
app.use("/api/template-categories", templateCategoryRoutes);
app.use("/api/template-subcategories", subCategoryRoutes);

app.get("/", (req, res) => {
  res.send("Banner App Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
