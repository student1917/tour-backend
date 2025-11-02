import Tour from "../models/Tour.js"
import Review from "../models/Review.js"


//create new review
export const createReview  = async (req,res) =>{

    const tourId = req.params.tourId
    
    try{
    const newReview = new Review({...req.body, productId: tourId})

        const savedReview = await newReview.save()

        //update rv in tour after creating...
        await Tour.findByIdAndUpdate(tourId,{
            $push : {reviews: savedReview._id}
        
        })

        res.status(200).json({
            success:true, 
            message:'Review submitted',
            data: savedReview
        })

    } catch(err) {
        console.error("Lỗi khi submit review:", err);
        res.status(500).json({
            success:false,
            message:'failed to submit',
        })
    }
}

//get all reviews
export const getAllReviews = async (req,res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const reviews = await Review.find().populate("productId", "title").skip(skip).limit(limit).sort({createdAt: -1})
        const total = await Review.countDocuments();
        
        res.status(200).json({
            success:true,
            data: reviews,
            pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit,
        },
        })
    } catch(err) {
        console.error(err);
        res.status(500).json({
            success:false,
            message:'Something went wrong',
        })
    }
}

export const deleteReview = async (req,res) => {
    const id = req.params.id
    try {
        const review = await Review.findById(id)
        if(!review) {
            return res.status(404).json({
                success:false,
                message:'Review not found',
            })
        }

        await Review.findByIdAndDelete(id)
        res.status(200).json({
            success:true,
            message:'Review deleted successfully',
        })
    } catch(err) {
        console.error(err);
        res.status(500).json({
            success:false,
            message:'Something went wrong',
        })
    }
}