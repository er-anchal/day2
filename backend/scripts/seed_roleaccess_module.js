import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Module from '../models/Module.js';
import RoleAccess from '../models/roleAccess.js';

async function seedRoleAccess() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // 1. Create Role Access module if not exists
    const moduleName = "Role Access";
    const modulePath = "/roleaccess";

    let mDoc = await Module.findOne({ name: moduleName });
    if (!mDoc) {
      mDoc = await Module.create({
        name: moduleName,
        path: modulePath,
        description: "Manage and allocate system permissions for roles",
        sortOrder: 100
      });
      console.log(`Created Module: ${moduleName}`);
    } else {
      console.log(`Module already exists: ${moduleName}`);
    }

    // 2. Grant permission for ADMIN and SUPER ADMIN role
    const roles = ["ADMIN", "SUPER ADMIN"];
    for (const r of roles) {
      const doc = await RoleAccess.findOne({ roleName: r });
      if (doc) {
        const hasPerm = doc.moduleAccess.some(item => item.moduleName.toLowerCase() === moduleName.toLowerCase());
        if (!hasPerm) {
          doc.moduleAccess.push({
            moduleName: moduleName,
            permissions: { view: true, create: false, edit: false, delete: false }
          });
          await doc.save();
          console.log(`Granted '${moduleName}' permission to role: ${r}`);
        } else {
          console.log(`Role '${r}' already has permission for '${moduleName}'`);
        }
      } else {
        // Create RoleAccess doc if not exists
        await RoleAccess.create({
          roleName: r,
          moduleAccess: [{
            moduleName: moduleName,
            permissions: { view: true, create: false, edit: false, delete: false }
          }],
          createdBy: null,
          createdByName: "system",
          createdOn: new Date().toLocaleString()
        });
        console.log(`Created RoleAccess doc and granted '${moduleName}' to role: ${r}`);
      }
    }
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

seedRoleAccess();
