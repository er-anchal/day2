import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
    console.error("No GEMINI_API_KEY found in .env");
    process.exit(1);
}

// 1x1 pixel base64 PNG
const imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

async function testMultimodal() {
    try {
        console.log("Calling Gemini Vision API with a 1x1 image...");
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey.trim().replace(/^["']|["']$/g, '')}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: "Is this image predominantly black, white, or red? Reply with exactly one word."
                            },
                            {
                                inlineData: {
                                    mimeType: "image/png",
                                    data: imageBase64
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0,
                    maxOutputTokens: 10
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("Response Status:", response.status);
        console.log("Full response data:", JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error("Gemini Vision call failed:");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Error data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("Message:", err.message);
        }
    }
}

testMultimodal();
