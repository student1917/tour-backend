import express from 'express'
import { login, register, verifyEmail, forgotPassword, resetPassword } from '../controllers/authController.js'
import { googleAuth } from "../controllers/googleAuthController.js";

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/verify-email', verifyEmail)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/google", googleAuth);

export default router