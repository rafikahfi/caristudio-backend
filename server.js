// 🌱 Load environment variables dari .env
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const studioRoutes = require("./routes/studioRoutes");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 Middleware Umum
app.use(
  cors({
    origin: "https://caristudio.my.id",
    credentials: true, // ini optional kalau lu pakai cookie atau auth
  })
);

app.use(express.json());

// ✅ Serve folder "uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔗 Routing ditaruh di awal supaya tetap dikenali, meskipun koneksi DB lambat
app.use("/api/studios", studioRoutes);
app.use("/api/admin", adminRoutes);

// 🧪 Cek koneksi server (buat manusia)
app.get("/", (req, res) => {
  res.send("🚀 Server CariStudio aktif!");
});

// 🔍 Ping endpoint
app.get("/ping", (req, res) => {
  res.status(200).send("OK");
});

// 🛡️ Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes("file gambar")) {
    return res.status(400).json({ message: err.message });
  }

  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    message: "❌ Terjadi kesalahan pada server.",
    error: err.message,
  });
});

// 🌐 Koneksi ke MongoDB Atlas lalu mulai server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ MongoDB Atlas connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server jalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Gagal konek MongoDB Atlas:", err);
  });

module.exports = app;
