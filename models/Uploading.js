import mongoose from 'mongoose'

const uploadingSchema = new mongoose.Schema({
    url: String,
    public_id: String,
    status: {
        type: String,
        enum: ['pending', 'used'],
        default: 'pending'
    }
})

export default mongoose.model('Uploading', uploadingSchema)