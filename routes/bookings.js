import express from 'express'

import {getBooking, getAllBooking, createBooking } from '../controllers/bookingController.js'
import {verifyAdmin, verifyUser} from "../utils/verifyToken.js"

const router = express.Router()

router.post('/', verifyUser, createBooking)

router.get('/:id', verifyUser, getBooking)

router.get('/', verifyAdmin, getAllBooking)


export default router