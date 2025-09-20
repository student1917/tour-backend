import Uploading from '../models/Uploading.js';
import cloudinary from '../utils/cloudinary.js';

export const uploadImage = async(req, res)=> {
    try{
        if (!req.file)
            return res.status(400).json({
                success: false,
                message: 'No data',
            })
                
        const base64 =req.file.buffer.toString('base64')
        const dataUri = `data:${req.file.mimetype};base64,${base64}`

        const result = await cloudinary.uploader.upload(dataUri, {folder:'tours'})

        const uploaded = await Uploading.create({
            url: result.secure_url,
            public_id: result.public_id,
            status: 'pending'
        })
        
        res.status(200).json({
            success: true,
            image: {
                url: uploaded.url,
                public_id: uploaded.public_id
            }
            
        })
    } catch (err) { 
        res.status(500).json({
            success: false,
            message: "Upload failed. Please try again."
        })       

    }
}