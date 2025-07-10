const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Studio = require("./models/Studio");

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dummyStudios = [
  {
    name: "Studio Harmoni",
    location: "Bekasi Selatan",
    price: 120000,
    images: ["https://via.placeholder.com/300"],
  },
  {
    name: "Studio RockOn",
    location: "Bekasi Timur",
    price: 90000,
    images: ["https://via.placeholder.com/300"],
  },
];

Studio.insertMany(dummyStudios)
  .then(() => {
    console.log("✅ Dummy data inserted!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ Error inserting data:", err);
  });
