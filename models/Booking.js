import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    username: {
      type: String,      
    },
    tourName: {
      type: String,      
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    guestSize: {
        type: Number,
        required:true
    },
    phone: {
        type: String,
        required:true
    },
    bookAt: {
        type: Date,
        required:true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'paid'],
      default: 'pending',
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
