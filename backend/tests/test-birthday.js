import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { checkAndCreateBirthdayNotification } from '../controllers/authController.js';

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // Get the first user
    const user = await User.findOne();
    if (!user) {
      console.log("No users found");
      process.exit(0);
    }

    console.log(`Testing with User ID: ${user._id}`);
    console.log(`Original DOB in DB: ${user.dob}`);

    // Set a test DOB to trigger the 0-3 days logic
    const today = new Date();
    // Test for a birthday that is TOMORROW
    today.setDate(today.getDate() + 1);
    
    // We want the DOB to be e.g. 1995 + current month + tomorrow's date
    const testDob = new Date(1995, today.getMonth(), today.getDate());
    
    console.log(`Setting Test DOB to: ${testDob.toISOString()}`);
    user.dob = testDob;
    await user.save();

    console.log("Calling checkAndCreateBirthdayNotification...");
    
    // Delete any existing notifications for this exact test case to ensure a clean run
    await Notification.deleteMany({ userId: user._id, type: "BIRTHDAY" });

    // Patch console.log to capture what the function would do internally (if we added logs, but let's just see if a notification is created)
    await checkAndCreateBirthdayNotification(user._id, user.dob);

    const notifs = await Notification.find({ userId: user._id, type: "BIRTHDAY" });
    console.log(`Notifications found after check: ${notifs.length}`);
    if (notifs.length > 0) {
      console.log("Notification details:");
      console.log(notifs[0].message);
      console.log("createdAt:", notifs[0].createdAt);
    } else {
      console.log("FAILED: No notification was created.");
    }

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

test();
