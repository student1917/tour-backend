import mongoose from "mongoose";
import Tour from "./models/Tour.js";
import Country from "./models/Country.js";
import dotenv from "dotenv";

dotenv.config();

async function migrateCountries() {
  await mongoose.connect(process.env.MONGO_URI);

  const tours = await Tour.find();

  for (let tour of tours) {
    // country hiện đang là string (vd: "Indonesia")
    const countryDoc = await Country.findOne({ name: tour.country });

    if (countryDoc) {
      // gán sang ObjectId
      tour.country = countryDoc._id;
      await tour.save();
      console.log(`Updated tour: ${tour.title} -> ${countryDoc.name}`);
    } else {
      console.warn(`⚠️ Không tìm thấy country cho: ${tour.country}`);
    }
  }

  console.log("Migration done!");
  process.exit();
}

migrateCountries();
