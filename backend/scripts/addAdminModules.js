import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Module from '../models/Module.js';
import RoleAccess from '../models/roleAccess.js';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const adminModules = [
      { name: "Templates", path: "/templates" },
      { name: "Categories", path: "/categories" },
      { name: "Subcategories", path: "/subcategories" },
      { name: "User Creation", path: "/usercreation" },
      { name: "FAQs", path: "/admin/faqs" },
      { name: "Queries", path: "/admin/queries" },
      { name: "Pricing", path: "/admin/pricing" }
    ];

    for (const m of adminModules) {
      const exists = await Module.findOne({ name: m.name });
      if (!exists) {
        await Module.create({
          name: m.name,
          path: m.path,
          sortOrder: 10
        });
        console.log(`Created Module: ${m.name}`);
      } else {
        console.log(`Module already exists: ${m.name}`);
      }
    }

    // Now, let's update default roleAccess documents in the database
    // for ADMIN and SUPER ADMIN to automatically include these new modules as view:true,
    // so they are checked by default on their first render.
    const rolesToUpdate = ["ADMIN", "SUPER ADMIN"];
    for (const roleName of rolesToUpdate) {
      const doc = await RoleAccess.findOne({ roleName: roleName });
      if (doc) {
        for (const m of adminModules) {
          const alreadyHas = doc.moduleAccess.some(item => item.moduleName.toLowerCase() === m.name.toLowerCase());
          if (!alreadyHas) {
            doc.moduleAccess.push({
              moduleName: m.name,
              permissions: { view: true, create: false, edit: false, delete: false }
            });
          }
        }
        await doc.save();
        console.log(`Updated permissions for role: ${roleName}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
