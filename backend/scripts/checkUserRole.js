import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const user = await User.findOne({ email: "anchal121@gmail.com" }).lean();
    if (user) {
      console.log("USER FOUND IN DB:");
      console.log(`- ID: ${user._id}`);
      console.log(`- Name: ${user.name}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role}`);
    } else {
      console.log("USER NOT FOUND: anchal121@gmail.com");
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

checkUser();
