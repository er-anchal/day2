import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Module from '../models/Module.js';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const modules = [
      { name: "Generate", path: "/dashboard", description: "AI Image Generation and Canvas Tools" },
      { name: "Create Reel", path: "/create-reel", description: "Generate beautiful Reels and short videos" },
      { name: "Catalogue", path: "/catalogue", description: "Product catalog and magazine pages" },
      { name: "My Designs", path: "/my-designs", description: "Manage saved user templates and graphics" },
      { name: "Favorites", path: "/favorites", description: "Your bookmarked assets and elements" },
      { name: "My Magazines", path: "/my-magazines", description: "Interactive flipbooks and magazine views" }
    ];

    for (const m of modules) {
      const existing = await Module.findOne({ name: m.name });
      if (!existing) {
        await Module.create(m);
        console.log(`Seeded module: ${m.name}`);
      } else {
        console.log(`Module already exists: ${m.name}`);
      }
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

seed();
