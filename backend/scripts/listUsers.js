import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';

async function list() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const users = await User.find({}).lean();
    console.log("ALL REGISTERED USERS:");
    users.forEach((u) => {
      console.log(`- Email: ${u.email} | Role: ${u.role} | Name: ${u.name}`);
    });
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

list();
