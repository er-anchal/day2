import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { exec, spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { promisify } from 'util';
import sharp from 'sharp';

const execPromise = promisify(exec);

// In-memory job store: jobId -> { status, progress, url, error }
const jobs = new Map();

/* ── Upload dir ── */
const UPLOAD_DIR = 'uploads/enhance';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename:    (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});
export const uploadEnhancer = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

/* ═══════════════════════════════════════
   IMAGE ENHANCE  — uses Sharp
   POST /api/enhance/image
   Body (form-data): file, scale, sharpen, denoise, format
═══════════════════════════════════════ */
export const enhanceImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const {
      scale   = '2',      // '1' | '2' | '4' | '8'
      sharpen = 'medium', // 'none' | 'light' | 'medium' | 'strong'
      denoise = 'light',  // 'none' | 'light' | 'strong'
      format  = 'png',    // 'png' | 'jpg' | 'webp'
    } = req.body;

    const inPath = req.file.path;
    const ext    = format === 'jpg' ? 'jpg' : format;
    const outName = `enhanced-${Date.now()}.${ext}`;
    const outPath = path.resolve(UPLOAD_DIR, outName);

    /* --- Read original dimensions --- */
    const meta      = await sharp(inPath).metadata();
    const origW     = meta.width  || 800;
    const origH     = meta.height || 600;
    const scaleNum  = parseInt(scale, 10) || 2;
    const targetW   = origW * scaleNum;
    const targetH   = origH * scaleNum;

    /* --- Build Sharp pipeline --- */
    let pipeline = sharp(inPath)
      .resize(targetW, targetH, { kernel: sharp.kernel.lanczos3, fit: 'fill' });

    // Denoise (median blur)
    if (denoise === 'light')  pipeline = pipeline.median(1);
    if (denoise === 'strong') pipeline = pipeline.median(3);

    // Sharpen
    const sharpenMap = {
      light:  { sigma: 0.8, m1: 0.3, m2: 0.5 },
      medium: { sigma: 1.2, m1: 0.6, m2: 0.7 },
      strong: { sigma: 2.0, m1: 1.0, m2: 1.0 },
    };
    if (sharpenMap[sharpen]) pipeline = pipeline.sharpen(sharpenMap[sharpen]);

    // Output
    if (format === 'jpg') pipeline = pipeline.jpeg({ quality: 100, mozjpeg: true });
    else if (format === 'webp') pipeline = pipeline.webp({ quality: 100, lossless: true });
    else pipeline = pipeline.png({ compressionLevel: 1 });   // fastest, max quality PNG

    await pipeline.toFile(outPath);

    // Clean up original upload
    fs.unlink(inPath, () => {});

    res.json({
      filename: outName,
      url: `${process.env.API_URL || "http://localhost:5001"}/uploads/enhance/${outName}`,
      originalSize: `${origW}×${origH}`,
      enhancedSize: `${targetW}×${targetH}`,
    });
  } catch (err) {
    console.error('Image enhance error:', err);
    res.status(500).json({ error: err.message });
  }
};

/* ═══════════════════════════════════════
   VIDEO ENHANCE  — spawn FFmpeg, stream real progress via SSE
   POST /api/enhance/video          → starts job, returns { jobId }
   GET  /api/enhance/video/progress/:jobId → SSE stream
   GET  /api/enhance/video/result/:jobId   → {url} when done
═══════════════════════════════════════ */

const RESOLUTION_MAP = {
  '720p':  '1280:-2',
  '1080p': '1920:-2',
  '1440p': '2560:-2',
  '4K':    '3840:-2',
  '8K':    '7680:-2',
};

export const enhanceVideo = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video uploaded' });

  const {
    resolution = '1080p',
    sharpen    = 'medium',
    denoise    = 'light',
    crf        = '18',
  } = req.body;

  const inPath  = req.file.path;
  const outName = `enhanced-${Date.now()}.mp4`;
  const outPath = path.resolve(UPLOAD_DIR, outName);

  /* --- Build vf filter chain --- */
  const filters = [];
  const scaleDim = RESOLUTION_MAP[resolution] || '1920:-2';
  filters.push(`scale=${scaleDim}:flags=lanczos`);

  const denoiseMap = { light: 'hqdn3d=2:1.5:3:2.5', medium: 'hqdn3d=4:3:6:4.5', strong: 'hqdn3d=8:6:12:9' };
  if (denoiseMap[denoise]) filters.push(denoiseMap[denoise]);

  const sharpenMap = { light: 'unsharp=3:3:0.5', medium: 'unsharp=5:5:1.0', strong: 'unsharp=7:7:2.0' };
  if (sharpenMap[sharpen]) filters.push(sharpenMap[sharpen]);

  /* --- Create job --- */
  const jobId = `job-${Date.now()}`;
  jobs.set(jobId, { status: 'processing', progress: 0, url: null, error: null });

  /* --- Spawn FFmpeg --- */
  const args = [
    '-y', '-i', inPath,
    '-vf', filters.join(','),
    '-c:v', 'libx264',
    '-crf', crf,
    '-preset', 'medium',          // fast but high quality (not slow)
    '-c:a', 'aac', '-b:a', '320k',
    '-movflags', '+faststart',
    '-progress', 'pipe:2',        // send progress JSON to stderr
    outPath,
  ];

  const ff = spawn(ffmpegPath, args);

  let totalFrames = 0;

  ff.stderr.on('data', (chunk) => {
    const txt = chunk.toString();

    // Parse total duration from FFmpeg header
    const durMatch = txt.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
    if (durMatch && !totalFrames) {
      const secs = parseInt(durMatch[1]) * 3600 + parseInt(durMatch[2]) * 60 + parseFloat(durMatch[3]);
      totalFrames = Math.round(secs * 30); // approximate at 30fps
    }

    // Parse current frame from -progress output
    const frameMatch = txt.match(/frame=(\d+)/);
    if (frameMatch && totalFrames > 0) {
      const pct = Math.min(95, Math.round((parseInt(frameMatch[1]) / totalFrames) * 100));
      const job = jobs.get(jobId);
      if (job) job.progress = pct;
    }
  });

  ff.on('close', (code) => {
    fs.unlink(inPath, () => {});
    const job = jobs.get(jobId);
    if (!job) return;
    if (code === 0) {
      job.status   = 'done';
      job.progress = 100;
      job.url      = `${process.env.API_URL || "http://localhost:5001"}/uploads/enhance/${outName}`;
    } else {
      job.status = 'error';
      job.error  = `FFmpeg exited with code ${code}`;
    }
  });

  res.json({ jobId });
};

/* Poll job progress — GET /api/enhance/video/status/:jobId */
export const videoJobStatus = (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
};

/* ── Download helper ── */
export const downloadEnhanced = (req, res) => {
  const filePath = path.resolve(UPLOAD_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.download(filePath);
};
