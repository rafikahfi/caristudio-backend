// app.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const studioRoutes = require("./routes/studioRoutes");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/studios", studioRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => res.send("🚀 Server CariStudio aktif!"));
app.get("/ping", (req, res) => res.status(200).send("OK"));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes("file gambar")) {
    return res.status(400).json({ message: err.message });
  }
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ message: "❌ Server error", error: err.message });
});

module.exports = app;
