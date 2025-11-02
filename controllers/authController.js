import User from '../models/User.js'
import Otp from '../models/Otp.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { generateOtp, verifyOtp } from "../services/otpService.js"


export const register = async (req, res) => {
    try {
      const { username, email, password, photo } = req.body;
  
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        if (!existingUser.isVerified) {
          await generateOtp(email, "register");
          return res.status(200).json({
            success: true,
            message: "Account already exists but not verified. OTP resent.",
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Email already registered.",
          });
        }
      }
  
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
  
      const newUser = new User({
        username,
        email,
        password: hash,
        photo,
        isVerified: false,
      });
  
      await newUser.save();
  
      await generateOtp(email, "register");
  
      res.status(200).json({
        success: true,
        message: "Successfully registered. Please verify your email with OTP.",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "Failed to register.",
      });
    }
  };


//user login
export const login = async(req,res)=> {
    const email = req.body.email

    try {
        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const checkCorrectPassword = await bcrypt.compare(req.body.password, user.password)


        if (!checkCorrectPassword) {           
            return res.status(401).json({
                sucess:false,
                message: "Incorrect email or pwd"
            })
        }

        const {password, role, ...rest} = user._doc

        const token = jwt.sign({id:user._id, role:user.role, username:user.username}, 
            process.env.JWT_SECRET_KEY,
            {expiresIn:"15d"}
            );

            res.cookie('accessToken', token, {
                httpOnly: true,
                // secure: process.env.NODE_ENV === "production",
                // secure: process.env.NODE_ENV === "production" ? true : false,
                secure: false,
                sameSite: "lax",
                // sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",  
                maxAge: 15 * 24 * 60 * 60 * 1000
            }).status(200).json({
                accessToken: token, 
                data: {...rest},
                role
            })        

    } catch (err) {
        console.error(err.message)
        return res.status(500).json({
            sucess:false,
            message: "Failed to login"
        })
    }
}

export const verifyEmail = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      const isValid = await verifyOtp(email, otp, "register");
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP.",
        });
      }
  
      await User.findOneAndUpdate(
        { email },
        { $set: { isVerified: true } }
      );
  
      res.status(200).json({
        success: true,
        message: "Email verified successfully.",
      });
    } catch (err) {
      console.error("Error in verifyEmail:", err.message);
      res.status(500).json({
        success: false,
        message: "Verification failed.",
      });
    }
  };


export const forgotPassword = async (req, res) => {
try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
    }

    await generateOtp(email, "forgot-password");
    res.status(200).json({ success: true, message: "OTP sent to your email" });
} catch (err) {
    console.error("Error in forgotPassword:", err.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
}
};


export const resetPassword = async (req, res) => {
try {
    const { email, otp, newPassword } = req.body;

    const isValid = await verifyOtp(email, otp, "forgot-password");
    if (!isValid) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    await User.findOneAndUpdate({ email }, { $set: { password: hash } });

    res.status(200).json({ success: true, message: "Password reset successfully" });
} catch (err) {
    console.error("Error in resetPassword:", err.message);
    res.status(500).json({ success: false, message: "Failed to reset password" });
}
};