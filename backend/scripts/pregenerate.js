import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { ensureTemplatesExist, generateFinalImage } from '../controllers/jewelleryController.js';

const downloadPendants = async () => {
  const pendantDir = path.resolve("uploads/jewellery/pendant");
  if (!fs.existsSync(pendantDir)) {
    fs.mkdirSync(pendantDir, { recursive: true });
  }

  const existingFiles = fs.readdirSync(pendantDir).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
  if (existingFiles.length < 5) {
    const needed = 5 - existingFiles.length;
    console.log(`[Pendant Prep] Found ${existingFiles.length} pendants. Need to generate ${needed} more samples...`);
    
    const prompts = [
      "High-quality clean studio product photography of a beautiful diamond flower pendant necklace, isolated on white background, jewelry catalog",
      "High-quality clean studio product photography of a luxury ruby heart pendant necklace in rose gold, isolated on white background, jewelry catalog",
      "High-quality clean studio product photography of a vintage emerald pendant necklace with gold filigree, isolated on white background, jewelry catalog",
      "High-quality clean studio product photography of a modern minimalist platinum geometric pendant, isolated on white background, jewelry catalog"
    ];

    for (let i = 0; i < needed; i++) {
      const prompt = prompts[i % prompts.length];
      const filename = `Pendant${i + 2}-${Date.now()}.png`;
      const outPath = path.join(pendantDir, filename);
      console.log(`[Pendant Prep] Generating sample ${i + 2}: ${filename}...`);
      try {
        await generateFinalImage(prompt, outPath);
        console.log(`[Pendant Prep] Saved sample ${i + 2} successfully.`);
      } catch (err) {
        console.error(`[Pendant Prep] Failed to generate pendant sample:`, err.message);
      }
    }
  } else {
    console.log(`[Pendant Prep] Already have ${existingFiles.length} pendant samples.`);
  }
};

const run = async () => {
  console.log("=== Starting Jewellery Template & Sample Pre-generation ===");
  try {
    console.log("[1/2] Ensuring all templates exist under uploads/jewellery_template/...");
    await ensureTemplatesExist();
    console.log("[2/2] Checking pendant samples...");
    await downloadPendants();
    console.log("=== Pre-generation Complete ===");
  } catch (error) {
    console.error("Pre-generation failed:", error);
  }
};

run();
