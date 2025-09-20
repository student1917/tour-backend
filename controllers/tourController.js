import Tour from '../models/Tour.js'
import Uploading from '../models/Uploading.js'
import Country from "../models/Country.js";

//create new tour
export const createTour = async (req, res) => {

    await Uploading.deleteMany({
        status:'pending',
        createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) }
    })
    try {
        const {imageId, ...tourData} = req.body

        if (!imageId)
            return res.status(400).json({
                success: false,
                message: 'No img-data'
            })
        
        const uploadedImage = await Uploading.findOne({public_id: imageId})
        if (!uploadedImage) 
            return res.status(400).json({
                success: false,
                message: 'Invalid img'
            })

        tourData.photo = uploadedImage.url;
        tourData.imageId = imageId;
        
        if (uploadedImage.status != 'used') {
            uploadedImage.status = 'used';
            await uploadedImage.save();
        }

        const newTour = new Tour(tourData)
        const savedTour = await newTour.save()

        res.status(200).json({
            success: true,
            message: 'Successfully created',
            data: savedTour,
          });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create. Try again' 
        });
    }
}

//update tour
export const updateTour = async (req, res) => {

    const id = req.params.id
    try {
        const updatedTour = await Tour.findByIdAndUpdate(id, {
            $set: req.body
        }, {new:true})

        res.status(200).json({
            success: true, message: 'Successfully updated',
            data: updatedTour
        })
    } catch (err) { 
        console.error("Error updating tour:", err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update. Try again'})
     }
}

//delete tour
export const deleteTour = async (req, res) => {
    const id = req.params.id
    try {
        await Tour.findByIdAndDelete(id)

        res.status(200).json({
            success: true, 
            message: 'Successfully deleted',
           
        })
    } catch (err) { 
        console.error("Error deleting tour:", err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete. Try again'})
     }
}
//getSingle tour
export const getSingleTour = async (req, res) => {
    const id = req.params.id
    try {
        const tour = await Tour.findById(id).populate('reviews')

        res.status(200).json({
            success: true,             
            message: 'Successfully',
            data: tour,
        })
    } catch (err) { 
        console.error("Error deleting tour:", err.message);
        res.status(404).json({ 
            success: false, 
            message: 'not found'})
     }
}
//getAll tour
export const getAllTour = async (req, res) => {

    //for pagination 
    const page = parseInt(req.query.page)

    try {
        const tours = await Tour.find({})
            .populate('reviews')
            .skip(page*8)
            .limit(8)

        res.status(200).json({
            success: true, 
            count: tours.length,
            message: 'Successful',
            data: tours,
        })
    } catch (err) { 
        res.status(404).json({ 
            success: false, 
            message: 'not found'})
     }
}


//get tour by search
export const getTourBySearch = async (req, res) => {
    try {
        const country = req.query.country || "";    
        const subregion = req.query.subregion || "";   
        const maxGroupSize = parseInt(req.query.maxGroupSize) || 0;

        const tours = await Tour.aggregate([
        {
            $lookup: {
            from: "countries",
            localField: "country",
            foreignField: "_id",
            as: "countryInfo"
            }
        },
        { $unwind: "$countryInfo" }, 
        {
            $match: {
            "countryInfo.name": { $regex: country, $options: "i" },
            "countryInfo.subregion": { $regex: subregion, $options: "i" },
            maxGroupSize: { $gte: maxGroupSize }
            }
        },
        { $addFields: { country: "$countryInfo" } },
        { $project: { countryInfo: 0 } } 
        ]);

        res.status(200).json({
        success: true,
        data: tours
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
        success: false,
        message: "Server error"
        });
    }
}


//getFeatured tour
export const getFeaturedTour = async (req, res) => {

    let page = parseInt(req.query.page);
    if (isNaN(page) || page < 0) page = 0;
    
    
    try {
        const tours = await Tour.find({featured:true}).populate('reviews')
            .skip(page*8)
            .limit(8)

        res.status(200).json({
            success: true, 
            count: tours.length,
            message: 'Successful',
            data: tours,
        })
    } catch (err) { 
        console.error("Error in getFeaturedTour:", err.message);
        res.status(404).json({ 
            success: false, 
            message: 'not found'})
     }
}

//get tour counts 
export const getTourCount = async(req,res) => {
    try {
        const tourCount = await Tour.estimatedDocumentCount();
        
        res.status(200).json({
            success: true,
            data: tourCount
        })
    } catch {
        res.status(500).json({
            success:false,
            message:'failed to fetch'
        })
    }
}

//get countries have tours
export const getTourCountries = async(req,res) => {

    try {
        const tours = await Tour.find().populate('country')

        const seen = new Set();
        const countries = [];

        for (const tour of tours) {
            if (tour.country && !seen.has(tour.country._id.toString())) {
                seen.add(tour.country._id.toString());
                countries.push({
                    _id: tour.country._id,
                    name: tour.country.name,
                    code: tour.country.code,
                    region: tour.country.region,
                    subregion: tour.country.subregion,
                    });
            }
        }
        res.status(200).json({
            success: true,
            count: countries.length,
            data: countries
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success:false,
            message:'failed to fetch'
        })
    }
}

export const getTourSubregions = async(req,res) => {
    try {
        const tours = await Tour.find().populate('country') 

        const subregions = new Set();
        tours.forEach(tour => {
            if (tour.country && tour.country.subregion) {
                subregions.add(tour.country.subregion);
            }
        });
        res.json([...subregions]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
}   
