// ===== controllers/studioController.js =====
const Studio = require("../models/Studio");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// ✅ GET semua studio
// ✅ GET semua studio (dengan filter q, kecamatan, kabupaten)
// ✅ GET semua studio (dengan filter q, kecamatan, kabupaten)
const getStudios = async (req, res) => {
  try {
    const { q, kecamatan, kabupaten } = req.query;

    const filter = [];

    if (q) {
      const regex = new RegExp(q, "i");
      filter.push({
        $or: [{ nama: regex }, { kecamatan: regex }, { alamat: regex }],
      });
    }

    // Ambil salah satu kalau ada kecamatan/kabupaten
    const finalKecamatan = kecamatan || kabupaten;
    if (finalKecamatan) {
      filter.push({
        $expr: {
          $regexMatch: {
            input: "$kecamatan",
            regex: `^${finalKecamatan}$`,
            options: "i",
          },
        },
      });
    }

    const studios = await Studio.find(filter.length ? { $and: filter } : {});
    res.json(studios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET studio by ID
const getStudioById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID studio tidak valid" });
  }

  try {
    const studio = await Studio.findById(id);
    if (!studio) {
      return res.status(404).json({ message: "Studio tidak ditemukan" });
    }
    res.json(studio);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil studio", error: err.message });
  }
};

// ✅ CREATE studio baru
const createStudio = async (req, res) => {
  try {
    const gambarUrls = (req.files?.gambar || []).map((file) => `uploads/${file.filename}`);
    const thumbnailPath = req.files?.thumbnail?.[0]?.filename ? `uploads/${req.files.thumbnail[0].filename}` : "";

    const hargaParsed = parseInt((req.body.harga_per_jam || "").toString().replace(/\./g, ""), 10);
    if (isNaN(hargaParsed) || hargaParsed < 0) {
      return res.status(400).json({ message: "❌ Harga per jam harus berupa angka positif." });
    }

    let jam_operasional = {};
    try {
      jam_operasional = req.body.jam_operasional ? JSON.parse(req.body.jam_operasional) : { buka: "", tutup: "" };
      if (!jam_operasional.buka || !jam_operasional.tutup) return res.status(400).json({ message: "❌ Jam buka dan tutup wajib diisi." });
    } catch (err) {
      return res.status(400).json({ message: "❌ Format jam_operasional tidak valid." });
    }

    let lokasi = {};
    try {
      lokasi = req.body.lokasi ? JSON.parse(req.body.lokasi) : {};
      if (!lokasi.lat || !lokasi.lng) return res.status(400).json({ message: "❌ Lokasi (lat/lng) wajib diisi." });
    } catch (err) {
      return res.status(400).json({ message: "❌ Format lokasi tidak valid." });
    }

    const studio = new Studio({
      nama: req.body.nama,
      kecamatan: req.body.kecamatan,
      deskripsi: req.body.deskripsi,
      alamat: req.body.alamat,
      no_telp: req.body.no_telp,
      harga_per_jam: hargaParsed,
      jam_operasional,
      lokasi,
      gambar: gambarUrls,
      thumbnail: thumbnailPath,
    });

    const saved = await studio.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "❌ Gagal menyimpan studio", error: err.message });
  }
};

// ✅ UPDATE studio by ID
const updateStudioById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID studio tidak valid" });
  }

  try {
    const studio = await Studio.findById(id);
    if (!studio) {
      return res.status(404).json({ message: "Studio tidak ditemukan untuk diupdate" });
    }

    const { nama, kecamatan, deskripsi, alamat, no_telp, harga_per_jam } = req.body;

    if (nama) studio.nama = nama;
    if (kecamatan) studio.kecamatan = kecamatan;
    if (deskripsi) studio.deskripsi = deskripsi;
    if (alamat) studio.alamat = alamat;
    if (no_telp) studio.no_telp = no_telp;

    if (harga_per_jam) {
      const parsed = parseInt(harga_per_jam.toString().replace(/\./g, ""), 10);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ message: "❌ Harga per jam tidak valid" });
      }
      studio.harga_per_jam = parsed;
    }

    try {
      if (req.body.jam_operasional) {
        const parsed = JSON.parse(req.body.jam_operasional);
        if (!parsed.buka || !parsed.tutup) return res.status(400).json({ message: "❌ Jam buka dan tutup wajib diisi." });
        studio.jam_operasional = parsed;
      }
    } catch (err) {
      return res.status(400).json({ message: "❌ Format jam_operasional tidak valid." });
    }

    try {
      if (req.body.lokasi) {
        studio.lokasi = JSON.parse(req.body.lokasi);
      }
    } catch (err) {
      return res.status(400).json({ message: "❌ Format lokasi tidak valid." });
    }

    let gambarLama = [];
    if (req.body.gambarLama) {
      try {
        const parsed = JSON.parse(req.body.gambarLama);
        gambarLama = Array.isArray(parsed) ? parsed : [parsed];
      } catch (err) {
        gambarLama = studio.gambar;
      }
    } else {
      gambarLama = studio.gambar;
    }

    const gambarBaru = (req.files?.gambar || []).map((file) => `uploads/${file.filename}`);
    const gambarYangDihapus = studio.gambar.filter((g) => !gambarLama.includes(g));
    gambarYangDihapus.forEach((imgPath) => {
      const fullPath = path.join(__dirname, "..", imgPath);
      fs.unlink(fullPath, (err) => {
        if (err) console.warn(`⚠️ Gagal hapus gambar: ${fullPath}`, err.message);
      });
    });

    studio.gambar = [...gambarLama, ...gambarBaru];

    // ✅ Ganti thumbnail jika ada file baru
    const thumbnailFile = req.files?.thumbnail?.[0];
    if (thumbnailFile) {
      // Hapus thumbnail lama jika ada
      if (studio.thumbnail) {
        const oldThumbPath = path.join(__dirname, "..", studio.thumbnail);
        fs.unlink(oldThumbPath, (err) => {
          if (err) {
            console.warn("⚠️ Gagal hapus thumbnail lama:", err.message);
          } else {
            console.log("🗑️ Thumbnail lama dihapus:", oldThumbPath);
          }
        });
      }

      studio.thumbnail = `uploads/${thumbnailFile.filename}`;
      console.log("📸 Thumbnail diganti:", studio.thumbnail);
    }

    const updatedStudio = await studio.save();
    res.json({ message: "✅ Studio berhasil diupdate", data: updatedStudio });
  } catch (err) {
    res.status(500).json({ message: "❌ Gagal update studio", error: err.message });
  }
};

// ✅ DELETE studio by ID
const deleteStudioById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID studio tidak valid" });
  }

  try {
    const studio = await Studio.findById(id);
    if (!studio) {
      return res.status(404).json({ message: "Studio tidak ditemukan untuk dihapus" });
    }

    [...studio.gambar, studio.thumbnail].forEach((imgPath) => {
      if (!imgPath) return;
      const fullPath = path.join(__dirname, "..", imgPath);
      fs.unlink(fullPath, (err) => {
        if (err) console.warn(`⚠️ Gagal hapus gambar: ${fullPath}`, err.message);
      });
    });

    await Studio.findByIdAndDelete(id);
    res.json({ message: "✅ Studio berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "❌ Gagal hapus studio", error: err.message });
  }
};

module.exports = {
  getStudios,
  getStudioById,
  createStudio,
  updateStudioById,
  deleteStudioById,
};
