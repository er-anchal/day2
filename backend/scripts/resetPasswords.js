import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';

async function reset() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const emails = ["admin@gmail.com", "anchal59937@gmail.com", "yash@gmail.com"];

    for (const email of emails) {
      const user = await User.findOne({ email: email });
      if (user) {
        user.password = "123456";
        await user.save();
        console.log(`Password reset successfully for user: ${email}`);
      } else {
        console.log(`User not found: ${email}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

reset();
