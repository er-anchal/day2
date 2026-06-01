import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import axios from 'axios';
import fs from 'fs';

const router = express.Router();

router.post('/scan-jewellery', upload.single('imageFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded!' });
        }

        const fileUrl = `/uploads/images/${req.file.filename}`;
        const localPath = req.file.path;

        // Valid subcategories list
        const categories = ["rings", "pendants", "bangles", "articles"];
        const subcategoryNameMap = {
            rings: "Rings",
            pendants: "Pendants",
            bangles: "Bangles",
            articles: "Articles"
        };

        const openaiApiKey = process.env.OPENAI_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!openaiApiKey && !geminiApiKey) {
            return res.status(400).json({ 
                success: false, 
                message: 'No active API Key found! Please add GEMINI_API_KEY (100% free from Google AI Studio) or OPENAI_API_KEY in your .env file and restart the server.' 
            });
        }

        let detectedSlug = null;
        let detectedName = null;
        let answer = null;

        // Convert image to base64
        const imageBase64 = fs.readFileSync(localPath, { encoding: 'base64' });
        const mimeType = req.file.mimetype || 'image/jpeg';

        // 1. Prefer Google Gemini (Free Vision Tier)
        if (geminiApiKey) {
            try {
                console.log("Using Google Gemini Vision API for classification...");
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
                    {
                        contents: [
                            {
                                parts: [
                                    {
                                        text: `You are an elite, highly specialized jewellery classification expert.
Your job is to identify the jewellery item shown in the image and classify it into EXACTLY one of these four categories: Rings, Pendants, Bangles, Articles.

Read these extremely detailed visual rules and definitions to make your choice:

1. RINGS (Fingerwear):
- Structure: A small circular band (torus shape) designed to be worn on a finger.
- Proportions: The inner diameter is small (typically around 15mm to 22mm / 0.6 to 0.8 inches).
- Characteristics: Often features a prominent gemstone, solitaire diamond, bezel, or decorative mount (setting) on top of the shank/band.
- Common Views: Seen from top-down showing the gem, side-profile showing the band loop, or tilted 3D angles showing both the band and the setting.
- Keywords: Wedding band, engagement ring, signet ring, eternity loop, statement finger ring.

2. PENDANTS (Neckwear Drops):
- Structure: A suspended decorative ornament designed to hang from a necklace, chain, or cord.
- Key Feature: Look closely at the top of the piece for a "bail" (a small metal loop, hook, eyelet, or passage for a chain to slip through).
- Proportions: Typically vertically oriented, flat or semi-flat back, with a decorative front face. It is a standalone focal piece, NOT a finger ring.
- Comparison: If it is circular but has a bail/loop at the very top for a chain, it is a Pendant, NOT a Ring!
- Keywords: Locket, medallion, charm, drop piece, necklace centerpiece, talisman, cross or pendant bail.

3. BANGLES (Wristwear):
- Structure: A large, rigid circular or semi-circular band designed to be worn on the wrist or forearm.
- Proportions: The inner diameter is large (typically 50mm to 75mm / 2 to 3 inches), which is much larger than a finger ring.
- Characteristics: Can be a solid closed circle, an open-ended cuff, or hinged with a clasp. Often decorated uniformly around the circumference or worn in multiples (stacks).
- Keywords: Rigid bracelet, kada, wrist cuff, wrist hoop, armlet.

4. ARTICLES (Earrings, Standalone, or Miscellaneous):
- Structure: Small ornaments worn on other body parts, loose items, or complex accessories.
- Key Subcategory - EARRINGS: Items worn on the ears (studs, hoops, drops, jhumkas, chandbalis). They usually feature a post, stud, hook, or clip backing to attach to an earlobe. Often displayed as a pair.
- Other Items: Nose rings (nath), brooches (pins), hair ornaments, loose gemstones/diamonds, or utility pieces.
- Catch-All: If the item is clearly none of the above (e.g. it is an earring or a loose gem), classify it as Articles.

Return ONLY the exact single word matching the selected category: "Rings", "Pendants", "Bangles", or "Articles". Do not provide any introduction, description, markdown, bullet points, or punctuation. Make a highly confident and accurate choice based on the visual guidelines above.`
                                    },
                                    {
                                        inlineData: {
                                            mimeType: mimeType,
                                            data: imageBase64
                                        }
                                    }
                                ]
                            }
                        ],
                        generationConfig: {
                            temperature: 0,
                            maxOutputTokens: 100
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        timeout: 15000
                    }
                );

                answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                console.log("Gemini Vision raw response:", answer);
                if (!answer) {
                    console.log("Gemini Vision full response:", JSON.stringify(response.data, null, 2));
                }

            } catch (geminiErr) {
                console.error("Gemini Vision API call failed:", geminiErr.message);
                throw new Error(`Gemini Vision analysis failed: ${geminiErr.response?.data?.error?.message || geminiErr.message}`);
            }
        } 
        // 2. Otherwise Fallback to OpenAI Vision
        else if (openaiApiKey) {
            try {
                console.log("Using OpenAI Vision API for classification...");
                const base64Url = `data:${mimeType};base64,${imageBase64}`;
                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    {
                                        type: 'text',
                                        text: `You are an elite, highly specialized jewellery classification expert.
Your job is to identify the jewellery item shown in the image and classify it into EXACTLY one of these four categories: Rings, Pendants, Bangles, Articles.

Read these extremely detailed visual rules and definitions to make your choice:

1. RINGS (Fingerwear):
- Structure: A small circular band (torus shape) designed to be worn on a finger.
- Proportions: The inner diameter is small (typically around 15mm to 22mm / 0.6 to 0.8 inches).
- Characteristics: Often features a prominent gemstone, solitaire diamond, bezel, or decorative mount (setting) on top of the shank/band.
- Common Views: Seen from top-down showing the gem, side-profile showing the band loop, or tilted 3D angles showing both the band and the setting.
- Keywords: Wedding band, engagement ring, signet ring, eternity loop, statement finger ring.

2. PENDANTS (Neckwear Drops):
- Structure: A suspended decorative ornament designed to hang from a necklace, chain, or cord.
- Key Feature: Look closely at the top of the piece for a "bail" (a small metal loop, hook, eyelet, or passage for a chain to slip through).
- Proportions: Typically vertically oriented, flat or semi-flat back, with a decorative front face. It is a standalone focal piece, NOT a finger ring.
- Comparison: If it is circular but has a bail/loop at the very top for a chain, it is a Pendant, NOT a Ring!
- Keywords: Locket, medallion, charm, drop piece, necklace centerpiece, talisman, cross or pendant bail.

3. BANGLES (Wristwear):
- Structure: A large, rigid circular or semi-circular band designed to be worn on the wrist or forearm.
- Proportions: The inner diameter is large (typically 50mm to 75mm / 2 to 3 inches), which is much larger than a finger ring.
- Characteristics: Can be a solid closed circle, an open-ended cuff, or hinged with a clasp. Often decorated uniformly around the circumference or worn in multiples (stacks).
- Keywords: Rigid bracelet, kada, wrist cuff, wrist hoop, armlet.

4. ARTICLES (Earrings, Standalone, or Miscellaneous):
- Structure: Small ornaments worn on other body parts, loose items, or complex accessories.
- Key Subcategory - EARRINGS: Items worn on the ears (studs, hoops, drops, jhumkas, chandbalis). They usually feature a post, stud, hook, or clip backing to attach to an earlobe. Often displayed as a pair.
- Other Items: Nose rings (nath), brooches (pins), hair ornaments, loose gemstones/diamonds, or utility pieces.
- Catch-All: If the item is clearly none of the above (e.g. it is an earring or a loose gem), classify it as Articles.

Return ONLY the exact single word matching the selected category: "Rings", "Pendants", "Bangles", or "Articles". Do not provide any introduction, description, markdown, bullet points, or punctuation. Make a highly confident and accurate choice based on the visual guidelines above.`
                                    },
                                    {
                                        type: 'image_url',
                                        image_url: {
                                            url: base64Url
                                        }
                                    }
                                ]
                            }
                        ],
                        max_tokens: 10,
                        temperature: 0
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${openaiApiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 15000
                    }
                );

                answer = response.data?.choices?.[0]?.message?.content?.trim();
                console.log("OpenAI Vision raw response:", answer);

            } catch (openaiErr) {
                console.error("OpenAI Vision API call failed:", openaiErr.message);
                throw new Error(`OpenAI Vision analysis failed: ${openaiErr.response?.data?.error?.message || openaiErr.message}`);
            }
        }

        if (answer) {
            const matchedSlug = answer.toLowerCase().replace(/[^a-z]/g, '');
            for (const cat of categories) {
                if (matchedSlug.includes(cat) || cat.includes(matchedSlug) || matchedSlug.includes(cat.slice(0, -1))) {
                    detectedSlug = cat;
                    detectedName = subcategoryNameMap[cat];
                    break;
                }
            }
        }

        if (!detectedSlug) {
            return res.status(400).json({
                success: false,
                message: `AI vision analyzed the image but returned '${answer}', which could not be mapped to one of the four categories: Rings, Pendants, Bangles, Articles.`
            });
        }

        res.status(200).json({
            success: true,
            message: `Recognized jewelry category: ${detectedName}`,
            detectedSubcategory: {
                name: detectedName,
                slug: detectedSlug
            },
            filePath: fileUrl,
            localPath: localPath
        });

    } catch (error) {
        console.error('Scan jewellery Error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Server error during scan-jewellery' 
        });
    }
});

router.post('/image', upload.single('imageFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Koi image upload nahi hui!' });
        }

        const fileUrl = `/uploads/images/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'Image successfully saved!',
            filePath: fileUrl,
            localPath: req.file.path 
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

import faqUpload from '../middleware/faqUploadMiddleware.js';

router.post('/faq-media', faqUpload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded!' });
        }

        let folder = 'other';
        if (req.file.mimetype.startsWith('image/')) folder = 'images';
        else if (req.file.mimetype.startsWith('video/')) folder = 'videos';
        else if (req.file.mimetype === 'application/pdf') folder = 'pdfs';

        const fileUrl = `/uploads/faq/${folder}/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'File successfully saved!',
            fileUrl: fileUrl
        });

    } catch (error) {
        console.error('FAQ Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server error during FAQ upload' });
    }
});

export default router;