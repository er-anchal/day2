import express from "express";
import {
  uploadVideo,
  uploadHandler,
  trimVideo,
  cropVideo,
  addSubtitles,
  downloadVideo,
  exportVideo,
  mergeVideos,
} from "../controllers/videoController.js";

const router = express.Router();

router.post("/upload", uploadVideo.single("video"), uploadHandler);
router.post("/upload-multiple", uploadVideo.array("videos", 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No video files uploaded" });
  const files = req.files.map(file => ({ filename: file.filename, path: file.path.replace(/\\/g, '/') }));
  res.json({ files });
});
router.post("/trim", trimVideo);
router.post("/crop", cropVideo);
router.post("/subtitles", addSubtitles);
router.post("/export", exportVideo);
router.post("/merge", mergeVideos);
router.get("/download/:filename", downloadVideo);

export default router;
