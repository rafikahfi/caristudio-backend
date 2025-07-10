// ===== models/Studio.js =====
const mongoose = require("mongoose");

const studioSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true },
    kecamatan: { type: String, required: true, trim: true },
    gambar: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "Minimal 1 gambar harus diunggah.",
      },
    },
    thumbnail: {
      type: String,
      default: "",
    },
    deskripsi: { type: String, required: true, trim: true },
    alamat: { type: String, required: true, trim: true },
    no_telp: { type: String, required: true, trim: true },
    harga_per_jam: { type: Number, required: true, min: 0 },
    jam_operasional: {
      type: {
        buka: { type: String, required: true, trim: true },
        tutup: { type: String, required: true, trim: true },
      },
      required: true,
    },
    lokasi: {
      type: {
        lat: {
          type: Number,
          required: true,
          validate: (v) => typeof v === "number" && !isNaN(v),
        },
        lng: {
          type: Number,
          required: true,
          validate: (v) => typeof v === "number" && !isNaN(v),
        },
      },
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Studio", studioSchema);
