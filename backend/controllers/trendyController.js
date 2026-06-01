import axios from 'axios';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().replace(/^["']|["']$/g, '') : '';

// Configure Multer for temp upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/trendy";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `temp-${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

export const uploadTrendy = multer({ storage });

// ─────────────────────────────────────────────────────────────
// STRUCTURED FEATURE EXTRACTION
// Ask Gemini specific constrained questions with fixed-choice
// answers. This prevents hallucination because Gemini cannot
// invent details — it picks from a defined set or writes "unclear".
// ─────────────────────────────────────────────────────────────
const extractStructuredFeatures = async (filePath, mimeType = "image/jpeg", retries = 4) => {
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString("base64");

  const body = {
    contents: [
      {
        parts: [
          {
            text: `Look at the PERSON in this photo and answer each question below.
Rules:
- Answer ONLY what is asked, no extra words.
- Use the exact choices given when choices are listed. Write "unclear" only if truly impossible to determine.
- For accessories and held objects: ONLY include if clearly and confidently visible. If in doubt, write "none".

--- SKIN & ETHNICITY ---
Q1_SKIN: Skin tone — choose one: very-light / light / medium / medium-dark / dark / very-dark
Q2_ETHNICITY: Ethnic facial appearance — choose one: South-Asian / East-Asian / Southeast-Asian / African / Latin / Middle-Eastern / White-European / mixed
Q2_GENDER: Age and gender appearance — choose one: baby-girl / baby-boy / girl / boy / woman / man

--- FACE STRUCTURE [CRITICAL] ---
Q3_FACE_SHAPE: Overall face shape — choose one: round / oval / heart / square / diamond / oblong
Q4_CHEEKS: Cheek fullness — choose one: full-round-cheeks / moderate-cheeks / defined-high-cheekbones / flat
Q5_JAW: Jawline shape — choose one: soft-rounded-jaw / defined-angular-jaw / pointed-chin / square-jaw
Q6_EYES_SHAPE: Eye shape — choose one: large-almond / small-almond / round / monolid / hooded / wide
Q7_EYES_PROMINENCE: Eye prominence — choose one: large-prominent / average / small
Q8_NOSE: Nose shape — choose one: broad-rounded / medium-rounded / narrow-straight / small-button / wide-flat
Q9_LIPS: Lip fullness — choose one: full-lips / medium-lips / thin-lips
Q10_EYEBROWS: Eyebrow shape — choose one: thick-straight / thick-arched / thin-arched / natural-moderate

--- HAIR ---
Q11_HAIR_LENGTH: Hair length — choose one: very-short / jaw-bob / shoulder / chest / waist / longer
Q12_HAIR_COLOR: Hair color — write the exact color (e.g. jet-black, dark-brown, black)
Q13_HAIR_TEXTURE: Hair texture — choose one: straight / loose-waves / natural-curls / tight-curls / coily
Q14_HAIR_STYLE: Hair arrangement — choose one: loose-and-open / half-up / high-ponytail / low-ponytail / bun / braid / other
Q15_HAIR_VOLUME: Hair volume — choose one: voluminous-thick / moderate / flat-thin

--- OUTFIT & STYLE [CRITICAL FOR ACCURACY] ---
Q16_TOP_TYPE: Upper body garment style/type. Be extremely specific. Identify all layers if the person is wearing multiple layers (e.g., "t-shirt with jacket", "shirt over t-shirt", "blazer over t-shirt", "kurti", "kurta", "shirt", "t-shirt", "top").
Q17_TOP_COLOR: Upper body garment exact colors. If there are layers, specify the color for each layer (e.g., "royal-blue inner and black outer", "white inner and navy-blue outer"). Otherwise write the single color (e.g., "mustard-yellow").
Q18_TOP_PATTERN: Upper body garment pattern or print style. If there are layers, specify the pattern/print of each layer (e.g., "solid inner and solid outer", "solid inner and checked outer"). Otherwise choose one: solid / vertical-stripes / geometric-print / floral-print / embroidered-with-motifs / leaf-paisley-print / checked / hand-block-print / gold-border-zari / other-print.
Q19_BOTTOM_TYPE: Lower body garment pants or dress bottom style & color together (e.g. white-kurta-pants, matching-kurti-pants, black-palazzo-pants, navy-jeans, beige-churidars, salwar-pants). Write "not-visible" if hidden.
Q20_FOOTWEAR: Footwear style — choose one: barefoot / sandals / sneakers / flats / ethnic-juttis / unclear

--- ACCESSORIES & ORNAMENTS ---
Q21_EARRINGS: Jhumkas or Earrings design. Look closely at the ears. If visible, identify style and design details (e.g. ornate-gold-jhumkas, silver-oxidized-jhumkas, pearl-drop-jhumkas, bell-shaped-gold-earrings, floral-studs). Be highly descriptive. Write "none" if not visible or unsure.
Q22_NECKLACE: Necklace or chain — write "yes" or "none". Only if clearly visible.
Q23_BINDI: Bindi on forehead — choose one: yes / no
Q24_GLASSES: Glasses or spectacles — choose one: yes / no
Q25_HELD_OBJECT: Is the person holding something? If yes, describe briefly (e.g. white-smartphone-mirror-selfie, handbag, book). Write "nothing" if hands are empty or unclear.

--- POSE & EXPRESSION ---
Q26_EXPRESSION: Facial expression — choose one: open-mouth-laugh-teeth / wide-smile-teeth / closed-smile / neutral
Q27_GAZE: Gaze direction — choose one: at-camera / looking-up / looking-down / looking-side
Q28_POSE: Body posture in 4-6 words (e.g. sitting on stone steps, standing taking mirror selfie)

--- BACKGROUND ---
Q29_SCENE_TYPE: Background type — choose one: temple-interior / temple-exterior / street / home-interior / modern-building / staircase / outdoor-nature / unclear
Q30_SCENE_DETAILS: Key background elements in one sentence (background only, do not mention the person)

Output each answer on its own line as: Q1_SKIN: [answer]`
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ]
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    let model;
    if (attempt <= 2) {
      model = "gemini-2.5-flash";
    } else if (attempt === 3) {
      model = "gemini-2.0-flash";
    } else {
      model = "gemini-flash-latest";
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
    try {
      console.log(`[Trendy] Gemini attempt ${attempt} using ${model}...`);
      const res = await axios.post(url, body, { timeout: 30000 });
      const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error("Empty response from Gemini");

      // Parse Q&A lines into an object
      const features = {};
      const lines = raw.split('\n');
      for (const line of lines) {
        const match = line.match(/^(Q\d+_[A-Z_]+):\s*(.+)$/);
        if (match) {
          features[match[1].trim()] = match[2].trim();
        }
      }
      console.log("[Trendy] Extracted features:", features);
      return features;

    } catch (err) {
      const status = err?.response?.status;
      const errMsg = err?.response?.data?.error?.message || err.message;
      const isRetryable = !status || status >= 500 || status === 429;
      if (attempt < retries && isRetryable) {
        let delay = attempt * 3000;
        if (status === 429) delay += 2000;
        console.warn(`[Trendy] Gemini attempt ${attempt} failed (status: ${status || 'network/timeout'}). Error: ${errMsg}. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw new Error(`Gemini feature extraction failed: ${errMsg}`);
      }
    }
  }
};

// ─────────────────────────────────────────────────────────────
// ENHANCED DESCRIPTION FOR TRADITIONAL INDIAN APPAREL & PATTERNS
// Helps Flux/Imagen understand local garments (kurti, kurta, etc.)
// and represent patterns (vertical stripes, etc.) with high fidelity
// ─────────────────────────────────────────────────────────────
const getDetailedGarmentDescription = (topType, topPattern, topColor = '') => {
  const topLower = (topType || '').toLowerCase().trim();
  const patLower = (topPattern || '').toLowerCase().trim();
  const colLower = (topColor || '').toLowerCase().trim();

  // 1. Check if it's layered
  let isLayered = false;
  if (
    topLower.includes('with') ||
    topLower.includes('over') ||
    topLower.includes('and') ||
    topLower.includes('layer') ||
    colLower.includes('inner') ||
    colLower.includes('outer') ||
    patLower.includes('inner') ||
    patLower.includes('outer')
  ) {
    // Make sure it's not just a single item like "embroidered-with-motifs" or "hand-block-print"
    const garmentKeywords = ['jacket', 'blazer', 'coat', 'shrug', 'cardigan', 'hoodie', 'shirt', 't-shirt', 'tshirt', 'top', 'kurti', 'kurta', 'saree', 'lehenga'];
    let garmentCount = 0;
    for (const kw of garmentKeywords) {
      if (topLower.includes(kw)) {
        garmentCount++;
      }
    }
    if (garmentCount >= 2 || colLower.includes('inner') || colLower.includes('outer') || patLower.includes('inner') || patLower.includes('outer')) {
      isLayered = true;
    }
  }

  if (isLayered) {
    // Determine inner and outer garments
    let innerType = '';
    let outerType = '';

    if (topLower.includes('jacket')) {
      outerType = 'jacket';
      if (topLower.includes('t-shirt') || topLower.includes('tshirt') || topLower.includes('tee')) {
        innerType = 't-shirt';
      } else if (topLower.includes('shirt')) {
        innerType = 'shirt';
      } else {
        innerType = 't-shirt';
      }
    } else if (topLower.includes('blazer')) {
      outerType = 'blazer';
      if (topLower.includes('t-shirt') || topLower.includes('tshirt') || topLower.includes('tee')) {
        innerType = 't-shirt';
      } else if (topLower.includes('shirt')) {
        innerType = 'shirt';
      } else {
        innerType = 'shirt';
      }
    } else if (topLower.includes('coat')) {
      outerType = 'coat';
      if (topLower.includes('t-shirt') || topLower.includes('tshirt') || topLower.includes('tee')) {
        innerType = 't-shirt';
      } else if (topLower.includes('shirt')) {
        innerType = 'shirt';
      } else {
        innerType = 'shirt';
      }
    } else if (topLower.includes('shrug') || topLower.includes('cardigan')) {
      outerType = topLower.includes('shrug') ? 'shrug' : 'cardigan';
      if (topLower.includes('t-shirt') || topLower.includes('tshirt') || topLower.includes('tee')) {
        innerType = 't-shirt';
      } else if (topLower.includes('shirt')) {
        innerType = 'shirt';
      } else {
        innerType = 'top';
      }
    } else if (
      (topLower.includes('shirt') && (topLower.includes('t-shirt') || topLower.includes('tshirt') || topLower.includes('tee'))) ||
      topLower.includes('both')
    ) {
      innerType = 't-shirt';
      outerType = 'button-up shirt (worn open)';
    } else {
      // Fallback layered parsing
      outerType = 'jacket';
      innerType = 'top';
    }

    // Determine colors
    let innerColor = 'white'; // neutral default
    let outerColor = 'colored';

    if (colLower.includes('inner') || colLower.includes('outer')) {
      const innerMatch = colLower.match(/([a-z\-]+)\s+inner/);
      const outerMatch = colLower.match(/([a-z\-]+)\s+outer/);
      if (innerMatch) innerColor = innerMatch[1];
      if (outerMatch) outerColor = outerMatch[1];

      // fallback splits
      if (innerColor === 'white' && outerColor === 'colored') {
        const parts = colLower.split(/and|,/);
        for (const part of parts) {
          if (part.includes('inner')) {
            innerColor = part.replace('inner', '').replace(/[\s\:]/g, '').trim();
          } else if (part.includes('outer')) {
            outerColor = part.replace('outer', '').replace(/[\s\:]/g, '').trim();
          }
        }
      }
    } else {
      outerColor = topColor || 'colored';
      innerColor = 'white';
    }

    // Determine patterns
    let innerPattern = 'solid';
    let outerPattern = 'solid';

    if (patLower.includes('inner') || patLower.includes('outer')) {
      const parts = patLower.split(/and|,/);
      for (const part of parts) {
        if (part.includes('inner')) {
          innerPattern = part.replace('inner', '').replace(/[\s\:]/g, '').trim();
        } else if (part.includes('outer')) {
          outerPattern = part.replace('outer', '').replace(/[\s\:]/g, '').trim();
        }
      }
    } else {
      outerPattern = topPattern || 'solid';
      innerPattern = 'solid';
    }

    // Get detailed descriptions for inner/outer (without recursively calling layering logic)
    const detailedInner = getDetailedGarmentDescription(innerType, innerPattern, '');
    const detailedOuter = getDetailedGarmentDescription(outerType, outerPattern, '');

    const innerDesc = `${innerColor} ${detailedInner.topTypeDetailed} (${detailedInner.topPatternDetailed})`;
    const outerDesc = `${outerColor} ${detailedOuter.topTypeDetailed} (${detailedOuter.topPatternDetailed})`;

    const layeredDesc = `layered outfit consisting of a ${innerDesc} worn underneath a ${outerDesc}`;

    return {
      topTypeDetailed: `${innerType} with ${outerType}`,
      topPatternDetailed: `${innerPattern} inner and ${outerPattern} outer`,
      isLayered: true,
      layeredDesc
    };
  }

  // Non-layered logic
  let topTypeDetailed = topType || 'top';
  if (topLower.includes('kurti')) {
    topTypeDetailed = 'kurti (traditional Indian long tunic top extending below the waist down to mid-thighs, worn loose and never tucked in)';
  } else if (topLower.includes('kurta')) {
    topTypeDetailed = 'kurta (traditional Indian long loose tunic shirt extending down to the knees, worn loose and never tucked in)';
  } else if (topLower.includes('saree')) {
    topTypeDetailed = 'saree (traditional Indian saree drapes elegantly over the shoulder)';
  } else if (topLower.includes('lehenga') || topLower.includes('choli')) {
    topTypeDetailed = 'lehenga-choli blouse (traditional Indian cropped blouse exposing the midriff)';
  } else if (topLower.includes('dupatta')) {
    topTypeDetailed = 'dupatta (long matching traditional shawl draped over the shoulder)';
  } else if (topLower.includes('t-shirt') || topLower.includes('tshirt') || topLower.includes('tee')) {
    topTypeDetailed = 't-shirt';
  } else if (topLower.includes('shirt')) {
    topTypeDetailed = 'button-up shirt';
  } else if (topLower.includes('blazer')) {
    topTypeDetailed = 'blazer jacket';
  } else if (topLower.includes('jacket')) {
    topTypeDetailed = 'jacket';
  }

  let topPatternDetailed = topPattern || 'solid';
  if (patLower.includes('vertical-stripes') || patLower === 'vertical stripes') {
    topPatternDetailed = 'prominent vertical stripes pattern all over the fabric';
  } else if (patLower.includes('geometric-print') || patLower === 'geometric print') {
    topPatternDetailed = 'prominent geometric print pattern';
  } else if (patLower.includes('floral-print') || patLower === 'floral print') {
    topPatternDetailed = 'detailed floral print pattern all over the fabric';
  } else if (patLower.includes('embroidered') || patLower.includes('motif')) {
    topPatternDetailed = 'detailed traditional embroidery with motifs';
  } else if (patLower.includes('leaf-paisley') || patLower.includes('paisley')) {
    topPatternDetailed = 'traditional leaf and paisley print pattern';
  } else if (patLower.includes('checked') || patLower.includes('check')) {
    topPatternDetailed = 'grid checked pattern';
  } else if (patLower.includes('hand-block') || patLower.includes('block-print')) {
    topPatternDetailed = 'traditional hand-block print pattern';
  } else if (patLower.includes('zari') || patLower.includes('gold-border')) {
    topPatternDetailed = 'traditional golden zari border detailing along the edges';
  } else if (patLower.includes('solid')) {
    topPatternDetailed = 'solid plain color with no prints or patterns';
  }

  return {
    topTypeDetailed,
    topPatternDetailed,
    isLayered: false,
    layeredDesc: ''
  };
};

// ─────────────────────────────────────────────────────────────
// BUILD PERSON DESCRIPTION from structured Q&A answers
// This is factual and deterministic — no hallucination possible.
// ─────────────────────────────────────────────────────────────
const buildPersonDescription = (f) => {
  // Skin tone with explicit warmth/depth descriptors
  const skinMap = {
    'very-light': 'very light peachy-beige complexion',
    'light':      'light warm beige complexion',
    'medium':     'medium warm brown complexion',
    'medium-dark':'medium-dark warm brown South Asian complexion',
    'dark':       'deep dark warm brown South Asian complexion',
    'very-dark':  'very deep dark brown South Asian complexion'
  };
  const skin = skinMap[f.Q1_SKIN] || `${f.Q1_SKIN || 'warm brown'} complexion`;
  const ethnicity = (f.Q2_ETHNICITY || 'South-Asian').replace(/-/g, ' ');
  const gender = (f.Q2_GENDER || 'person').replace(/-/g, ' ');

  // Face structure — the most critical part for likeness
  const faceShape    = f.Q3_FACE_SHAPE    || 'oval';
  const cheeks       = f.Q4_CHEEKS        || 'moderate-cheeks';
  const jaw          = f.Q5_JAW           || 'soft-rounded-jaw';
  const eyeShape     = f.Q6_EYES_SHAPE    || 'almond';
  const eyeSize      = f.Q7_EYES_PROMINENCE || 'average';
  const nose         = f.Q8_NOSE          || 'medium-rounded';
  const lips         = f.Q9_LIPS          || 'medium-lips';
  const brows        = f.Q10_EYEBROWS     || 'natural-moderate';

  const faceDesc =
    `${faceShape} face shape with ${cheeks.replace(/-/g, ' ')}, ` +
    `${jaw.replace(/-/g, ' ')}, ` +
    `${eyeShape.replace(/-/g, ' ')} ${eyeSize.replace(/-/g, ' ')} eyes, ` +
    `${nose.replace(/-/g, ' ')} nose, ` +
    `${lips.replace(/-/g, ' ')}, ` +
    `${brows.replace(/-/g, ' ')} eyebrows`;

  // Hair
  const hairLen   = f.Q11_HAIR_LENGTH  || 'shoulder';
  const hairColor = f.Q12_HAIR_COLOR   || 'dark brown';
  const hairTex   = f.Q13_HAIR_TEXTURE || 'wavy';
  const hairStyle = f.Q14_HAIR_STYLE   || 'loose-and-open';
  const hairVol   = f.Q15_HAIR_VOLUME  || 'moderate';
  const hairDesc  =
    `${hairLen}-length ${hairColor} hair, ${hairTex.replace(/-/g, ' ')}, ` +
    `${hairVol.replace(/-/g, ' ')}, worn ${hairStyle.replace(/-/g, ' ')}`;

  // Outfit
  const topType    = f.Q16_TOP_TYPE    || 'top';
  const topColor   = f.Q17_TOP_COLOR   || 'colored';
  const topPattern = f.Q18_TOP_PATTERN || 'solid';
  const bottom     = (f.Q19_BOTTOM_TYPE && f.Q19_BOTTOM_TYPE !== 'not-visible')
    ? f.Q19_BOTTOM_TYPE : null;

  const { topTypeDetailed, topPatternDetailed, isLayered, layeredDesc } = getDetailedGarmentDescription(topType, topPattern, topColor);

  const topDesc    = isLayered ? layeredDesc : `${topColor} ${topTypeDetailed} with ${topPatternDetailed}`;
  const outfitDesc = bottom
    ? `UPPER BODY: ${topDesc} | LOWER BODY: ${bottom}`
    : `outfit: ${topDesc}`;

  // Accessories
  const earrings  = (f.Q21_EARRINGS && f.Q21_EARRINGS !== 'none') ? f.Q21_EARRINGS : null;
  const necklace  = f.Q22_NECKLACE === 'yes';
  const bindi     = f.Q23_BINDI    === 'yes';
  const glasses   = f.Q24_GLASSES  === 'yes';
  const heldObj   = (f.Q25_HELD_OBJECT && f.Q25_HELD_OBJECT !== 'nothing') ? f.Q25_HELD_OBJECT : null;

  const accessories = [
    earrings  ? `${earrings.replace(/-/g, ' ')}${!earrings.toLowerCase().includes('earring') && !earrings.toLowerCase().includes('jhumka') ? ' earrings' : ''}` : null,
    necklace  ? 'thin necklace' : null,
    bindi     ? 'bindi on forehead' : null,
    glasses   ? 'glasses' : null
  ].filter(Boolean).join(', ') || 'no visible accessories';

  // Expression & pose
  const expression = f.Q26_EXPRESSION || 'smiling';
  const gaze       = f.Q27_GAZE       || 'at-camera';
  const pose       = f.Q28_POSE       || 'standing';

  return (
    `${ethnicity} ${gender} with ${skin}. ` +
    `FACE STRUCTURE: ${faceDesc}. ` +
    `HAIR: ${hairDesc}. ` +
    `OUTFIT — ${outfitDesc}. ` +
    `Accessories: ${accessories}. ` +
    `${heldObj ? `Holding: ${heldObj}. ` : ''}` +
    `Pose: ${pose}. Expression: ${expression}, gaze ${gaze}.`
  );
};

// ─────────────────────────────────────────────────────────────
// STYLE PROMPTS — take a factual person description + scene
// and wrap it in the style-specific art direction.
// ─────────────────────────────────────────────────────────────
const STYLES = {

  figurine: {
    prompt: (personDesc) =>
      `Ultra-realistic studio product photograph of a premium Bandai/Funko Pop collectible 3D plastic action figurine. ` +
      `The figurine is a PRECISE miniature plastic replica of: ${personDesc} ` +
      `FIGURINE: Hard translucent plastic body with subsurface light scattering. Detailed hand-painted face — exact skin tone preserved, exact hair length and color preserved, exact upper and lower outfit preserved as separate painted garments with all patterns and print details. Confident heroic standing pose. ` +
      `DISPLAY BOX: Figurine sealed inside a premium collector's display box with a large clear acetate window. Cardboard backing is rich blue-to-purple gradient with holographic foil stickers, bold character name typography, and series branding on the sides. ` +
      `BASE: Circular clear acrylic base with engraved name plate. ` +
      `LIGHTING: Three-point studio lighting, rim highlights on plastic edges, soft gray gradient bokeh background. Sharp DSLR macro focus. Photorealistic 8K product photography.`,
  },

  avatar: {
    prompt: (personDesc) =>
      `A stunning 3D Blender Claymation render. The clay character is a stylized version of: ${personDesc} ` +
      `CHARACTER: Smooth matte clay skin — same skin depth and warmth as the real person. Oversized expressive eyes. Rounded friendly face keeping the person's ethnic features. Same hair length and color as smooth matte clay strands. ` +
      `OUTFIT: Clay-textured version of the EXACT same separate garments — upper garment (same color and pattern sculpted in clay relief) AND lower garment (same color as the original). Accessories only if present in the real photo. ` +
      `POSE: Sitting cross-legged, hands on knees, warm smile. ` +
      `PLATFORM: Seated on top of a GIANT glossy 3D neon social media app icon (Instagram gradient purple-pink-orange rounded square). Neon glow radiates upward bathing the character. ` +
      `BACKGROUND: Soft lavender-to-mint green gradient. Floating clay stars, hearts, sparkles. Ambient occlusion shadow beneath the icon. 45-degree isometric camera. Blender Cycles, 4K.`,
  },

  anime: {
    prompt: (personDesc, sceneDesc) => {
      // Extract key features for explicit anti-bias instructions
      const isDark = personDesc.includes('dark') || personDesc.includes('medium-dark');
      const hasLongHair = personDesc.includes('chest') || personDesc.includes('waist') || personDesc.includes('longer');
      const hasCurls = personDesc.includes('curls') || personDesc.includes('coily') || personDesc.includes('waves');

      // Extract specific skin tone context to override defaults
      let skinInstruction = 'exact skin tone described above';
      if (personDesc.includes('very light') || personDesc.includes('very-light') || personDesc.includes('peachy-beige')) {
        skinInstruction = 'very light peachy-beige skin tone — do NOT make it dark or brown';
      } else if (personDesc.includes('light warm beige') || personDesc.includes('light')) {
        skinInstruction = 'light warm beige skin tone — do NOT make it dark or brown';
      } else if (personDesc.includes('medium')) {
        skinInstruction = 'medium warm brown skin tone — do NOT make it pale, keep it medium';
      }

      return (
        `Hand-painted watercolor anime illustration. Full-body shot — show the entire character from head to feet, NOT just a portrait. Cinematic composition with full scene visible.\n\n` +

        `=== CHARACTER IDENTITY — PRESERVE EXACTLY ===\n` +
        `Person details: ${personDesc}\n\n` +

        `=== SKIN TONE — NON-NEGOTIABLE ===\n` +
        `${isDark
          ? 'The character MUST have deep warm dark brown South Asian skin. Render using warm brown and amber watercolor washes. This is NOT pale, NOT beige, NOT East Asian light skin. South Asian dark skin rendered in warm watercolor — rich caramel to dark brown tones.'
          : `Render the character with the exact ${skinInstruction} in soft watercolor washes.`
        }\n\n` +

        `=== FACE STRUCTURE — NON-NEGOTIABLE ===\n` +
        `Preserve the person's exact face shape and features as described above. ` +
        `If the face is round with full cheeks, the anime face must be round with full cheeks — NOT a narrow V-chin. ` +
        `If the eyes are large and almond-shaped, keep them large and almond. ` +
        `Represent South Asian facial structure — NOT East Asian monolid default. ` +
        `Do NOT apply generic anime face defaults. Faithfully adapt the described face shape.\n\n` +

        `=== HAIR — NON-NEGOTIABLE ===\n` +
        `${hasLongHair ? 'The hair is LONG — keep the full length. Do NOT shorten to a bob or shoulder-length.' : 'Keep exact hair length as described.'}\n` +
        `${hasCurls ? 'The hair has natural curls/waves — render as curly or wavy anime hair strands, NOT straight hair.' : 'Render the exact hair texture described.'}\n\n` +

        `=== OUTFIT — NON-NEGOTIABLE ===\n` +
        `Render the EXACT outfit described — upper garment and lower garment as separate pieces with their exact colors. ` +
        `Do NOT change the garment colors. Do NOT merge a top and bottom into a single dress. ` +
        `Reproduce any print, embroidery, or pattern details as delicate anime fabric artwork.\n\n` +

        `=== HELD OBJECTS ===\n` +
        `If the person is holding something (e.g. a smartphone for a mirror selfie), show it in the character's hand.\n\n` +

        `=== EXPRESSION & POSE ===\n` +
        `Match the person's exact expression and pose. Wide open-mouth smile = show that energy. Sitting pose = sit the same way.\n\n` +

        `=== BACKGROUND ===\n` +
        `Render this scene in warm painterly watercolor washes: ${sceneDesc || 'an Indian temple corridor with wooden beam ceiling, carved dark wooden balusters, warm ambient light, other visitors visible in distance'}. ` +
        `Soft impressionistic brushstrokes. Above the structure: dreamy cerulean blue sky with large fluffy cumulus clouds, golden hour light. Few flower petals floating in air.\n\n` +

        `=== STYLE ===\n` +
        `Hand-painted anime watercolor illustration. Paper grain texture. Color bleeding at edges. Translucent watercolor washes. Clean confident ink outlines on character. Masterpiece quality. 4K. Full body visible.`
      );
    }
  }
};

// ─────────────────────────────────────────────────────────────
// SHORT PROMPT for Pollinations (URL-safe, max ~450 chars)
// Focuses on what matters most: outfit color, hair length/texture
// ─────────────────────────────────────────────────────────────
const buildShortPrompt = (f, style, sceneDesc) => {
  // Skin
  const skinMapShort = {
    'very-light': 'fair skin tone',
    'light':      'light skin tone',
    'medium':     'medium skin tone',
    'medium-dark':'medium-dark skin tone',
    'dark':       'deep warm dark brown skin tone',
    'very-dark':  'very deep dark brown skin tone'
  };
  const skin = skinMapShort[f.Q1_SKIN] || 'warm brown skin tone';
  const ethnicity = (f.Q2_ETHNICITY || 'South-Asian').replace(/-/g, ' ');
  const gender = (f.Q2_GENDER || 'person').replace(/-/g, ' ');

  // Face details for structural accuracy
  const faceShape = f.Q3_FACE_SHAPE || 'oval';
  const cheeks = f.Q4_CHEEKS && f.Q4_CHEEKS !== 'flat' ? f.Q4_CHEEKS.replace(/-/g, ' ') : '';
  const jaw = f.Q5_JAW ? f.Q5_JAW.replace(/-/g, ' ') : '';
  const eyeShape = f.Q6_EYES_SHAPE ? f.Q6_EYES_SHAPE.replace(/-/g, ' ') : '';
  const faceDesc = [
    `${faceShape} face shape`,
    cheeks ? `${cheeks}` : null,
    jaw ? `${jaw}` : null,
    eyeShape ? `${eyeShape} eyes` : null
  ].filter(Boolean).join(', ');

  // ★ HAIR — preserve exact length & texture
  const hairLen  = f.Q11_HAIR_LENGTH || 'shoulder';
  const hairCol  = f.Q12_HAIR_COLOR   || 'black';
  const hairTex  = (f.Q13_HAIR_TEXTURE || 'wavy').replace(/-/g,' ');
  const hairVol  = f.Q15_HAIR_VOLUME === 'voluminous-thick' ? 'voluminous' : '';
  
  let hairLenDesc = '';
  if (hairLen === 'very-short') hairLenDesc = 'very short';
  else if (hairLen === 'longer') hairLenDesc = 'very long';
  else hairLenDesc = `${hairLen.replace(/-/g, ' ')}-length`;

  const hairDesc = `${hairLenDesc} ${hairCol} ${hairTex}${hairVol ? ' ' + hairVol : ''} hair`;

  // ★ OUTFIT — preserve separate garments and colors
  const topColor   = f.Q17_TOP_COLOR   || 'colored';
  const topType    = f.Q16_TOP_TYPE    || 'top';
  const topPattern = f.Q18_TOP_PATTERN || 'solid';
  const bottom     = (f.Q19_BOTTOM_TYPE && f.Q19_BOTTOM_TYPE !== 'not-visible')
    ? f.Q19_BOTTOM_TYPE.replace(/-/g,' ') : '';

  const { topTypeDetailed, topPatternDetailed, isLayered, layeredDesc } = getDetailedGarmentDescription(topType, topPattern, topColor);

  let outfitDesc = '';
  const isEthnicTop = ['kurti', 'kurta', 'lehenga-top', 'dupatta', 'salwar', 'blouse', 'saree'].some(x => topType.toLowerCase().includes(x));
  const styleTerm = isEthnicTop ? 'traditional ethnic styling' : 'modern styling';

  if (isLayered) {
    if (bottom) {
      outfitDesc = `OUTFIT (do NOT merge): upper garment is a beautiful ${layeredDesc} (${styleTerm}) and lower garment is ${bottom}. The colors of the garments must remain distinct.`;
    } else {
      outfitDesc = `OUTFIT: wearing a gorgeous ${layeredDesc} (${styleTerm})`;
    }
  } else {
    if (bottom) {
      outfitDesc = `OUTFIT (two separate garments, do NOT merge): upper garment is a beautiful ${topColor} ${topTypeDetailed} (${styleTerm}, pattern: ${topPatternDetailed}) and lower garment is ${bottom}. The colors of the two garments must remain distinct.`;
    } else {
      outfitDesc = `OUTFIT: wearing a gorgeous ${topColor} ${topTypeDetailed} (${styleTerm}, pattern: ${topPatternDetailed})`;
    }
  }

  // Accessories / Jhumkas
  const earrings = (f.Q21_EARRINGS && f.Q21_EARRINGS !== 'none') ? f.Q21_EARRINGS.replace(/-/g, ' ') : '';
  let earringDesc = '';
  if (earrings) {
    const containsEarringOrJhumka = earrings.toLowerCase().includes('earring') || earrings.toLowerCase().includes('jhumka');
    earringDesc = `wearing stunning visible ${earrings}${!containsEarringOrJhumka ? ' earrings' : ''}`;
  }
  const heldObj  = (f.Q25_HELD_OBJECT && f.Q25_HELD_OBJECT !== 'nothing') ? f.Q25_HELD_OBJECT : '';

  // Expression
  const expr = f.Q26_EXPRESSION === 'open-mouth-laugh-teeth' ? 'laughing with mouth open showing teeth'
    : f.Q26_EXPRESSION === 'wide-smile-teeth' ? 'wide smile showing teeth'
    : 'warm smile';

  const scene = (sceneDesc || '').slice(0, 120);

  if (style === 'figurine') {
    return `Premium collectible 3D plastic action figurine in Bandai Funko Pop display box. ` +
      `Figurine of a ${ethnicity} ${gender} with ${skin}, ${faceDesc}. ` +
      `HAIR (preserve exact length & texture): ${hairDesc}. ` +
      `${outfitDesc}. ` +
      `${earringDesc ? earringDesc + '. ' : ''}` +
      `Acrylic base, studio bokeh lighting, 8K product photography.`;
  }

  if (style === 'avatar') {
    return `3D Blender clay render cute avatar of a ${ethnicity} ${gender} with ${skin}, ${faceDesc}. ` +
      `HAIR (preserve exact length & texture): clay-sculpted ${hairDesc}. ` +
      `${outfitDesc} clay-textured. ` +
      `${earringDesc ? 'Wearing ' + earringDesc + '. ' : ''}` +
      `Sitting cross-legged on giant glowing neon Instagram icon. ` +
      `Lavender-mint gradient background, floating sparkles. Isometric, Blender Cycles 4K.`;
  }

  // anime
  return `Hand-painted watercolor anime illustration of a ${ethnicity} ${gender} with ${skin}, FULL BODY visible from head to feet. ` +
    `FACE (preserve exactly): ${faceDesc}, ${ethnicity} features NOT East Asian. ` +
    `HAIR (critical, preserve exact length & texture): ${hairDesc}. ` +
    `${outfitDesc}. ` +
    `${earringDesc ? earringDesc + '. ' : ''}` +
    `${heldObj ? 'Holding: ' + heldObj + '. ' : ''}` +
    `${expr}. ` +
    `${scene ? 'Background: ' + scene + ' painted in watercolor washes. ' : ''}` +
    `Watercolor paper grain, ink outlines, dreamy sky with clouds above, 4K masterpiece.`;
};

// ─────────────────────────────────────────────────────────────
// IMAGE GENERATION
// Pollinations: short URL-safe prompt (no URL length limit issues)
// Imagen 3:     full detailed prompt via POST (no URL limit)
// ─────────────────────────────────────────────────────────────
const generateImage = async (shortPrompt, fullPrompt, outPath) => {
  // Primary: Pollinations / Flux with SHORT prompt (with retries)
  let pollinationsSucceeded = false;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`[Trendy] Generating with Pollinations/Flux (Attempt ${attempt})...`);
      console.log("[Trendy] Short prompt length:", shortPrompt.length, "chars");
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?model=flux&width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
      const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 50000 });
      if (response.data?.byteLength > 5000) {
        fs.writeFileSync(outPath, response.data);
        console.log("[Trendy] Pollinations succeeded.");
        pollinationsSucceeded = true;
        break;
      }
      throw new Error("Pollinations returned empty/small image");
    } catch (err) {
      console.warn(`[Trendy] Pollinations attempt ${attempt} failed:`, err.message);
      if (attempt < 2) {
        console.log("[Trendy] Retrying Pollinations in 2 seconds...");
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  if (pollinationsSucceeded) return true;

  // Fallback: Imagen 4 with FULL detailed prompt (POST — no URL limit)
  try {
    console.log("[Trendy] Trying Imagen 4 with full prompt...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_KEY}`;
    const body = {
      instances: [{ prompt: fullPrompt }],
      parameters: { sampleCount: 1, aspectRatio: "1:1", outputMimeType: "image/png" }
    };
    const res = await axios.post(url, body, { timeout: 35000 });
    const base64 = res.data?.predictions?.[0]?.bytesBase64Encoded;
    if (base64) {
      fs.writeFileSync(outPath, Buffer.from(base64, "base64"));
      console.log("[Trendy] Imagen 4 succeeded.");
      return true;
    }
    throw new Error("Imagen 4 returned no image");
  } catch (err) {
    console.error("[Trendy] Imagen 4 also failed:", err.message);
    throw new Error("All image generation methods failed: " + err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────
export const generateTrendyTemplate = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No image file uploaded" });
  }

  const { style } = req.body;
  if (!style || !STYLES[style]) {
    try { fs.unlinkSync(req.file.path); } catch(_) {}
    return res.status(400).json({ success: false, error: "Invalid style selected" });
  }

  const inPath = req.file.path;
  const mimeType = req.file.mimetype || "image/jpeg";
  const outName = `trendy-${style}-${Date.now()}.png`;
  const outPath = path.resolve("uploads/trendy", outName);
  const relativePath = `uploads/trendy/${outName}`;

  try {
    // 1. Extract structured features via constrained Q&A
    console.log("[Trendy] Extracting structured features...");
    const features = await extractStructuredFeatures(inPath, mimeType);

    // 2. Build deterministic person description from features
    const personDescription = buildPersonDescription(features);
    const sceneDescription  = features.Q30_SCENE_DETAILS || "";
    console.log("[Trendy] Person:", personDescription);
    console.log("[Trendy] Scene:", sceneDescription);

    // 3. Build SHORT prompt for Pollinations (URL-safe, outfit+hair focused)
    const shortPrompt = buildShortPrompt(features, style, sceneDescription);
    console.log("[Trendy] Short prompt (", shortPrompt.length, "chars):", shortPrompt);

    // 4. Build FULL detailed prompt for Imagen 3 fallback (POST — no URL limit)
    const fullPrompt = style === 'anime'
      ? STYLES[style].prompt(personDescription, sceneDescription)
      : STYLES[style].prompt(personDescription);
    console.log("[Trendy] Full prompt (", fullPrompt.length, "chars)");

    // 5. Generate image — short prompt → Pollinations, full prompt → Imagen 3
    await generateImage(shortPrompt, fullPrompt, outPath);

    // Cleanup
    try { fs.unlinkSync(inPath); } catch(_) {}

    res.json({
      success: true,
      filename: outName,
      path: relativePath,
      style,
      personDescription,
      sceneDescription,
      shortPrompt,
      features
    });

  } catch (error) {
    console.error("[Trendy] Error:", error);
    try { fs.unlinkSync(inPath); } catch(_) {}
    res.status(500).json({ success: false, error: error.message || "Failed to generate trendy template" });
  }
};
