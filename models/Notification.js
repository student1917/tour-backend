import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Booking" 
  },
  customer: { 
    type: String 
  },
  tourName: { 
    type: String 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Notification", notificationSchema);
