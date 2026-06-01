import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import ffmpegPath from "ffmpeg-static";
import { promisify } from "util";

const execPromise = promisify(exec);

// Configure Multer for video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/videos";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\\s+/g, "_")}`);
  },
});

export const uploadVideo = multer({ storage });

export const uploadHandler = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No video file uploaded" });
  res.json({ filename: req.file.filename, path: req.file.path });
};

export const trimVideo = async (req, res) => {
  const { filename, startTime, endTime } = req.body;
  if (!filename || startTime == null || endTime == null) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const inputPath = path.resolve("uploads/videos", filename);
  const outputFilename = `trimmed-${Date.now()}-${filename}`;
  const outputPath = path.resolve("uploads/videos", outputFilename);
  const relativePath = `uploads/videos/${outputFilename}`;

  try {
    const duration = endTime - startTime;
    const command = `"${ffmpegPath}" -ss ${startTime} -i "${inputPath}" -t ${duration} -c:v libx264 -preset fast -c:a aac "${outputPath}"`;
    await execPromise(command);
    res.json({ filename: outputFilename, path: relativePath });
  } catch (error) {
    console.error("FFmpeg Trim Error:", error);
    res.status(500).json({ error: "Failed to trim video" });
  }
};

export const cropVideo = async (req, res) => {
  const { filename, x, y, width, height } = req.body;
  if (!filename || x == null || y == null || width == null || height == null) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const inputPath = path.resolve("uploads/videos", filename);
  const outputFilename = `cropped-${Date.now()}-${filename}`;
  const outputPath = path.resolve("uploads/videos", outputFilename);
  const relativePath = `uploads/videos/${outputFilename}`;

  try {
    const command = `"${ffmpegPath}" -i "${inputPath}" -filter:v "crop=${width}:${height}:${x}:${y}" -c:a copy "${outputPath}"`;
    await execPromise(command);
    res.json({ filename: outputFilename, path: relativePath });
  } catch (error) {
    console.error("FFmpeg Crop Error:", error);
    res.status(500).json({ error: "Failed to crop video" });
  }
};

// Helper to convert seconds to SRT timestamp format (HH:MM:SS,mmm)
const formatSrtTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const date = new Date(0);
  date.setSeconds(Math.floor(seconds));
  const timeString = date.toISOString().substr(11, 8); // HH:MM:SS
  const milliseconds = String(Math.floor((seconds % 1) * 1000)).padStart(3, "0");
  return `${timeString},${milliseconds}`;
};

export const addSubtitles = async (req, res) => {
  const { filename, subtitles } = req.body; // subtitles: [{ text, time, end }]
  if (!filename || !subtitles || !Array.isArray(subtitles)) {
    return res.status(400).json({ error: "Missing filename or subtitles array" });
  }

  const inputPath = path.resolve("uploads/videos", filename);
  const outputFilename = `subtitled-${Date.now()}-${filename}`;
  const outputPath = path.resolve("uploads/videos", outputFilename);
  const relativePath = `uploads/videos/${outputFilename}`;

  try {
    const sortedSubs = [...subtitles].sort((a, b) => a.startTime - b.startTime);
    
    const filters = sortedSubs.map(sub => {
      const start = sub.startTime !== undefined ? sub.startTime : sub.time;
      const end = sub.endTime !== undefined ? sub.endTime : (sub.end !== undefined ? sub.end : start + 3);
      const safeText = sub.text.replace(/'/g, "\\'").replace(/:/g, "\\:");
      const fontfile = "C\\\\:/Windows/Fonts/arial.ttf";
      const fs = sub.fontSize || 48;
      // Convert hex color to FFmpeg format (e.g. #ffffff -> white, or pass hex)
      const hexToFfmpeg = (hex) => {
        if (!hex || !hex.startsWith('#')) return 'white';
        return `0x${hex.slice(1)}`;
      };
      const fontcolor = hexToFfmpeg(sub.color);
      return `drawtext=fontfile='${fontfile}':text='${safeText}':enable='between(t,${start},${end})':x=(w-text_w)/2:y=h-th-40:fontsize=${fs}:fontcolor=${fontcolor}:box=1:boxcolor=black@0.5:boxborderw=5`;
    }).join(',');

    const command = `"${ffmpegPath}" -i "${inputPath}" -vf "${filters}" -c:v libx264 -preset fast -c:a aac "${outputPath}"`;
    await execPromise(command);

    res.json({ filename: outputFilename, path: relativePath });
  } catch (error) {
    console.error("FFmpeg Subtitle Error:", error);
    res.status(500).json({ error: "Failed to add subtitles" });
  }
};

export const downloadVideo = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(process.cwd(), "uploads/videos", filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
};

export const exportVideo = async (req, res) => {
  const { filename, quality, resolution } = req.body;
  if (!filename) {
    return res.status(400).json({ error: "Missing filename" });
  }

  const inputPath = path.resolve("uploads/videos", filename);
  const outputFilename = `exported-${Date.now()}-${filename}`;
  const outputPath = path.resolve("uploads/videos", outputFilename);
  const relativePath = `uploads/videos/${outputFilename}`;

  try {
    let filterString = "";
    if (resolution === "480p") filterString = "-vf scale=-2:480";
    if (resolution === "720p") filterString = "-vf scale=-2:720";
    if (resolution === "1080p") filterString = "-vf scale=-2:1080";

    let crfValue = 23; 
    if (quality === "High") crfValue = 18;
    if (quality === "Medium") crfValue = 23;
    if (quality === "Small File") crfValue = 28;

    let command = `"${ffmpegPath}" -i "${inputPath}"`;
    if (filterString) command += ` ${filterString}`;
    
    if (quality === "Original" && resolution === "Original") {
       command += ` -c copy "${outputPath}"`;
    } else {
       command += ` -c:v libx264 -crf ${crfValue} -preset fast -c:a aac -b:a 128k "${outputPath}"`;
    }

    await execPromise(command);
    res.json({ filename: outputFilename, path: relativePath });
  } catch (error) {
    console.error("FFmpeg Export Error:", error);
    res.status(500).json({ error: "Failed to export video" });
  }
};

export const mergeVideos = async (req, res) => {
  const { filenames } = req.body;
  if (!filenames || !Array.isArray(filenames) || filenames.length < 2) {
    return res.status(400).json({ error: "Provide an array of at least 2 filenames" });
  }

  const outputFilename = `merged-${Date.now()}.mp4`;
  const outputPath = path.resolve("uploads/videos", outputFilename);
  const relativePath = `uploads/videos/${outputFilename}`;
  const listPath = path.resolve("uploads/videos", `list-${Date.now()}.txt`);

  try {
    // Create concat list file
    let listContent = "";
    filenames.forEach(file => {
      const p = path.resolve("uploads/videos", file).replace(/\\/g, '/');
      listContent += `file '${p}'\n`;
    });
    fs.writeFileSync(listPath, listContent);

    // Concat and re-encode to ensure compatibility
    const command = `"${ffmpegPath}" -f concat -safe 0 -i "${listPath}" -c:v libx264 -preset fast -c:a aac "${outputPath}"`;
    await execPromise(command);

    // Clean up temp list file
    try { fs.unlinkSync(listPath); } catch (_) {}

    res.json({ filename: outputFilename, path: relativePath });
  } catch (error) {
    console.error("FFmpeg Merge Error:", error);
    res.status(500).json({ error: "Failed to merge videos" });
  }
};

