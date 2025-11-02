import express from 'express'
import {uploadImage, deleteImage} from '../controllers/uploadController.js'
import { uploadSingle, uploadMultiple} from '../middlewares/multer.js';


const router = express.Router()

//
router.post('/upload-image', uploadSingle, uploadImage)
router.post('/upload-gallery', uploadMultiple, uploadImage)
router.delete('/:public_id', deleteImage);

export default router;