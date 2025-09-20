import bcrypt from "bcryptjs";
import Otp from "../models/Otp.js";
import { sendMail } from "./mailService.js";
import { otpEmailTemplate } from "../utils/otpEmail.js";

export const generateOtp = async (email, purpose) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);

  await Otp.create({
    email,
    codeHash: otpHash,
    purpose,
    expireAt: new Date(Date.now() + process.env.OTP_EXPIRE_MIN * 60 * 1000),
  });

  await sendMail(email, "OTP Verification", otpEmailTemplate(otp));
  return otp;
};

export const verifyOtp = async (email, otp, purpose) => {
  const record = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });
  if (!record) return false;
  if (record.expireAt < Date.now()) return false;

  const isMatch = await bcrypt.compare(otp, record.codeHash);
  if (!isMatch) return false;

  await Otp.deleteOne({ _id: record._id }); 
  return true;
};
