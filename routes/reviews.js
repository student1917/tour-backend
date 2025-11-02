import express from 'express'
import { createReview, getAllReviews, deleteReview } from '../controllers/reviewController.js'
import {verifyUser} from "../utils/verifyToken.js"

const router = express.Router()


router.post('/:tourId', verifyUser, createReview)
router.get('/', getAllReviews)
router.delete('/:id', deleteReview)

export default router