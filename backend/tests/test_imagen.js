import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().replace(/^["']|["']$/g, '') : '';

async function testModel(modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${GEMINI_KEY}`;
  console.log(`Testing model: ${modelName} with URL: ${url}`);
  try {
    const body = {
      instances: [{ prompt: "A single pearl ring on a plain gray background" }],
      parameters: { sampleCount: 1, aspectRatio: "1:1", outputMimeType: "image/png" }
    };
    const res = await axios.post(url, body);
    console.log(`[${modelName}] Success! Bytes length:`, res.data?.predictions?.[0]?.bytesBase64Encoded?.length);
    return true;
  } catch (err) {
    console.error(`[${modelName}] Failed with status ${err.response?.status}:`);
    console.error(JSON.stringify(err.response?.data, null, 2) || err.message);
    return false;
  }
}

async function run() {
  await testModel("imagen-4.0-generate-001");
}

run();
