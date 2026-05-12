import express from "express";
import fs from "fs";
import path from "path";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/templates-birth-anniversary", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/birth_anniversary");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-birthday", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/birthday");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-congrats", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/congrats");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-cycle_day", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/cycle_day");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-death_anniversary", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/death_anniversary");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-get_well_soon", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/get_well_soon");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-gods", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/gods");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-good_morning", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/good_morning");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-good_night", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/good_night");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-headers_footers", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/headers_footers");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-innocent_children", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/innocent_children");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-milk_day", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/milk_day");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-motivational", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/motivational");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-nag_panchami", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/nag_panchami");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-nature", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/nature");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-parents_day", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/parents_day");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-political", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/political");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-quotes", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/quotes");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-rip", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/rip");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-shivdin_vishesh", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/shivdin_vishesh");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-thankyou", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/thankyou");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-wedding_anniversary", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/wedding_anniversary");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const images = files.filter((file) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(file),
    );

    res.json(images);
  });
});

router.get("/templates-videos", (req, res) => {
  const uploadsDir = path.join(process.cwd(), "uploads/videos");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read uploads" });
    }

    const videos = files.filter((file) => /\.(mp4)$/i.test(file));

    res.json(videos);
  });
});

export default router;
