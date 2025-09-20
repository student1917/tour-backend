import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type:String,
        required:true
    },
    purpose: {
        type:String,
        enum: ["register", "forgot-password"], 
        required: true,
    },
    codeHash: { 
        type: String, 
        required: true 
    },
    expireAt: { 
        type: Date, 
        required: true },
},{
    timestamps: true
  })

  otpSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);