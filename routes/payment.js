import express from 'express'
import { createMomoPayment, handleMomoIPN, payWithCash, getMonthlyRevenue } from '../controllers/paymentController.js'

const router = express.Router()

router.post('/payWithCash', payWithCash)

router.post("/momo", createMomoPayment)
router.post('/momo-ipn', handleMomoIPN)

router.get('/monthly', getMonthlyRevenue);

export default router