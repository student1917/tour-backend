import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    // verify token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();


    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        username: payload.name,     
        email: payload.email,
        photo: payload.picture,
        googleId: payload.sub,
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 ngày
      })
      .status(200)
      .json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          photo: user.photo,
          role: user.role,
        },
      });
  } catch (err) {
    console.error("Google Auth Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};
