// ===== routes/studioRoutes.js =====
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { getStudios, getStudioById, createStudio, updateStudioById, deleteStudioById } = require("../controllers/studioController");

// ✅ Storage setting
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `studio-${Date.now()}-${Math.round(Math.random() * 1e4)}${ext}`;
    cb(null, uniqueName);
  },
});

// ✅ File filter (gambar only)
const fileFilter = (req, file, cb) => {
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Hanya file gambar (.jpg, .jpeg, .png, .webp) yang diperbolehkan."));
  }
};

// ✅ Init multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// ✅ Middleware untuk upload "gambar" dan "thumbnail"
const studioUpload = upload.fields([
  { name: "gambar", maxCount: 20 },
  { name: "thumbnail", maxCount: 1 },
]);

// ✅ Routes
router.get("/", getStudios);
router.get("/:id", getStudioById);

// POST Studio Baru
router.post(
  "/",
  studioUpload,
  (req, res, next) => {
    if (!req.files || (!req.files.gambar && !req.files.thumbnail)) {
      return res.status(400).json({ message: "❌ File gambar atau thumbnail tidak ditemukan." });
    }
    next();
  },
  createStudio
);

// PUT Update Studio
router.put("/:id", studioUpload, updateStudioById);

// DELETE Studio
router.delete("/:id", deleteStudioById);

module.exports = router;
