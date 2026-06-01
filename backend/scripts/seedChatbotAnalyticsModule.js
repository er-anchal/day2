import mongoose from "mongoose";
import dotenv from "dotenv";
import Module from "../models/Module.js";
import RoleAccess from "../models/roleAccess.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mananjha643_db_user:rFiAwYYfOYXYxouL@cluster0.jlsdmut.mongodb.net/AiImageEditor?appName=Cluster0";

async function main() {
  console.log("Connecting to:", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB!");

  const moduleName = "Chatbot Analytics";
  const modulePath = "/admin/chatbot-analytics";

  // 1. Seed Module if missing
  let analyticsModule = await Module.findOne({ path: modulePath });
  if (!analyticsModule) {
    console.log(`Module for path "${modulePath}" not found. Creating it...`);
    analyticsModule = await Module.create({
      name: moduleName,
      path: modulePath,
      icon: "bar_chart",
      description: "Admin panel to view chatbot metrics, heatmaps, and intent analytics",
      sortOrder: 16,
      isActive: "true",
      createdByName: "system"
    });
    console.log("[SUCCESS] Registered Module:", analyticsModule);
  } else {
    console.log("[INFO] Module is already registered in DB:", analyticsModule.name);
  }

  // 2. Grant access to ADMIN and SUPER ADMIN roles
  const rolesToGrant = ["ADMIN", "SUPER ADMIN"];
  for (const roleName of rolesToGrant) {
    let roleAccessDoc = await RoleAccess.findOne({ roleName });
    if (roleAccessDoc) {
      // Check if Chatbot Analytics is already in moduleAccess
      const alreadyHasAccess = roleAccessDoc.moduleAccess.some(
        (item) => item.moduleName.toLowerCase().trim() === moduleName.toLowerCase().trim()
      );

      if (!alreadyHasAccess) {
        console.log(`Granting "${moduleName}" access to role "${roleName}"...`);
        roleAccessDoc.moduleAccess.push({
          moduleName: moduleName,
          permissions: {
            view: true,
            create: true,
            edit: true,
            delete: true
          }
        });
        roleAccessDoc.modifiedAt = new Date();
        roleAccessDoc.modifiedOn = new Date().toLocaleString();
        await roleAccessDoc.save();
        console.log(`[SUCCESS] Access granted to "${roleName}".`);
      } else {
        console.log(`[INFO] Role "${roleName}" already has access to "${moduleName}".`);
      }
    } else {
      console.log(`RoleAccess document for "${roleName}" not found. Creating a new one...`);
      roleAccessDoc = await RoleAccess.create({
        roleName,
        moduleAccess: [{
          moduleName: moduleName,
          permissions: {
            view: true,
            create: true,
            edit: true,
            delete: true
          }
        }],
        createdByName: "system",
        createdOn: new Date().toLocaleString()
      });
      console.log(`[SUCCESS] Created new RoleAccess doc for "${roleName}" with Chatbot Analytics privileges.`);
    }
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
