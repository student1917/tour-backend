import express from 'express'
import { createMomoPayment, handleMomoIPN, payWithCash } from '../controllers/paymentController.js'

const router = express.Router()

router.post('/payWithCash', payWithCash)

router.post("/momo", createMomoPayment)
router.post('/momo-ipn', handleMomoIPN)

export default router