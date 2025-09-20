import dotenv from "dotenv";
import mongoose from "mongoose";
import Country from "./models/Country.js";
import countries from "world-countries";

dotenv.config();

async function seedCountries() {
  try {    
    const mongoUri = process.env.MONGO_URI;

    await mongoose.connect(mongoUri);

    const data = countries.map(c => ({
      name: c.name.common,
      code: c.cca2,
      region: c.region || "Other",
      subregion: c.subregion || "Other"
    }));

    await Country.deleteMany();
    await Country.insertMany(data);

    console.log("Seeded countries successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedCountries();