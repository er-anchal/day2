import mongoose from "mongoose";
import dotenv from "dotenv";
import Module from "../models/Module.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mananjha643_db_user:rFiAwYYfOYXYxouL@cluster0.jlsdmut.mongodb.net/AiImageEditor?appName=Cluster0";

async function main() {
  console.log("Connecting to:", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB!");

  const modules = await Module.find({});
  console.log("\nRegistered Modules:");
  console.log("===================");
  modules.forEach(m => {
    console.log(`- Name: "${m.name}", Path: "${m.path}", ID: ${m._id}`);
  });

  const chatbotModule = modules.find(m => m.path === "/admin/chatbot-flows");
  if (!chatbotModule) {
    console.log("\n[WARNING] Chatbot Q&A Module (/admin/chatbot-flows) is MISSING in modules database!");
  } else {
    console.log("\n[SUCCESS] Chatbot Q&A Module (/admin/chatbot-flows) is registered.");
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
