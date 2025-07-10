// 🌱 Load environment variables dari .env
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const studioRoutes = require("./routes/studioRoutes");
const adminRoutes = require("./routes/admin");
const { Server } = require("http");

const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 Middleware Umum
app.use(cors());
app.use(express.json());

// ✅ Serve folder "uploads" agar bisa diakses dari frontend
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🌐 Koneksi ke MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ MongoDB Atlas connected");

    // 🔗 Routing utama (dipindah ke sini agar hanya aktif setelah DB connect)
    app.use("/api/studios", studioRoutes);
    app.use("/api/admin", adminRoutes);

    // 🧪 Cek koneksi server (buat manusia)
    app.get("/", (req, res) => {
      res.send("🚀 Server CariStudio aktif!");
    });

    // 🔍 Ping endpoint (buat frontend React ngecek koneksi)
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

    // 🚀 Jalankan server setelah semuanya siap
    app.listen(PORT, () => {
      console.log(`🚀 Server jalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Gagal konek MongoDB Atlas:", err);
  });

module.exports = app;
