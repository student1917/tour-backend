import express from 'express'

import {getBooking, getAllBooking, createBooking, getUserBookings } from '../controllers/bookingController.js'
import {verifyAdmin, verifyUser} from "../utils/verifyToken.js"

const router = express.Router()

router.post('/', verifyUser, createBooking)

router.get('/:id', verifyUser, getBooking)

router.get('/', verifyAdmin, getAllBooking)
// router.get('/', getAllBooking)

router.get('/user/:userId', getUserBookings)


export default router