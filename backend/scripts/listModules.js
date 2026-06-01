import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Module from '../models/Module.js';

async function list() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const modules = await Module.find({}).sort({ sortOrder: 1 }).lean();
    console.log("ALL REGISTERED MODULES:");
    modules.forEach((m) => {
      console.log(`- Name: ${m.name} | Path: ${m.path}`);
    });
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

list();
