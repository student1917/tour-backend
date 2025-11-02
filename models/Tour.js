import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: mongoose.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    photos: [{
      url: { type: String, required: true },
      isThumbnail: { type: Boolean, default: false }
    }],
    imageId: {
      type: String,
    },
    desc: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    maxGroupSize: {
      type: Number,
      required: true,
    },

    reviews: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Review",
      },
    ],
    bookingCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    itinerary: [
      {
        day: { type: Number, required: true },  
        title: { type: String, required: true },
        activities: [
          {
            title: { type: String, required: true },
            description: { type: String },          
          },
        ],
        images: [String],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Tour", tourSchema, "tours_v2");
