// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true, 
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["momo", "vnpay", "cash"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  momoResponse: {
    type: Object, 
    default: null,
  },
  ipnVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

export default mongoose.model("Payment", paymentSchema);
