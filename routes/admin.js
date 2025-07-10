const express = require("express");
const router = express.Router();

console.log("✅ Route admin.js berhasil dibaca oleh server");

const ADMIN_EMAIL = "admin@caristudio.com";
const ADMIN_PASSWORD = "admin182";

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.status(200).json({ success: true, role: "admin" });
  } else {
    return res.status(401).json({ success: false, message: "Email atau password salah!" });
  }
});

module.exports = router;
