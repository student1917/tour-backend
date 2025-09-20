import express from 'express'
import {uploadImage} from '../controllers/uploadController.js'
import { uploadSingle, uploadMultiple } from '../middlewares/multer.js';


const router = express.Router()

//
router.post('/upload-image', uploadSingle, uploadImage)
router.post('/upload-gallery', uploadMultiple, uploadImage)

export default router;