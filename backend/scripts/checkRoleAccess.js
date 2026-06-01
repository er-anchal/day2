import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import RoleAccess from '../models/roleAccess.js';

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const docs = await RoleAccess.find({}).lean();
    console.log("ALL ROLE ACCESS DOCUMENTS IN DB:");
    console.log(JSON.stringify(docs, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

check();
