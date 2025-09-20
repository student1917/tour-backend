import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  }, 
  code: { 
    type: String, 
    required: true, 
    unique: true 
  }, 
  region: { 
    type: String, 
    required: true 
  },
  subregion: {   
    type: String,
    required: false,
  },
});

export default mongoose.model("Country", countrySchema, "countries");
