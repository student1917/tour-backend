import Tour from '../models/Tour.js'
import Uploading from '../models/Uploading.js'
import Country from "../models/Country.js";

//create new tour
export const createTour = async (req, res) => {
  try {
    const { photos, ...tourData } = req.body;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No img-data",
      });
    }

    const thumbnailPhoto = photos.find((p) => p.isThumbnail) || photos[0];

    const imageId = thumbnailPhoto.imageId || thumbnailPhoto.public_id;
    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image must have imageId or public_id",
      });
    }

    const uploadedThumbnail = await Uploading.findOne({ public_id: imageId });
    if (!uploadedThumbnail) {
      return res.status(400).json({
        success: false,
        message: "Invalid thumbnail image",
      });
    }

    if (uploadedThumbnail.status !== "used") {
      uploadedThumbnail.status = "used";
      await uploadedThumbnail.save();
    }

    for (const photo of photos) {
      const pubId = photo.imageId || photo.public_id;
      if (!pubId) continue;
      const uploadedImg = await Uploading.findOne({ public_id: pubId });
      if (uploadedImg && uploadedImg.status !== "used") {
        uploadedImg.status = "used";
        await uploadedImg.save();
      }
    }

    tourData.photos = photos.map((p) => ({
      url: p.url || "",  
      isThumbnail: !!p.isThumbnail,
    }));

    tourData.imageId = imageId;

    const newTour = new Tour(tourData);
    const savedTour = await newTour.save();

    return res.status(200).json({
      success: true,
      message: "Successfully created",
      data: savedTour,
    });
  } catch (err) {
    console.error("Error creating tour:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create. Try again",
    });
  }
};

//update tour
export const updateTour = async (req, res) => {

    const id = req.params.id
    try {
        const { isVisible, featured, ...rest } = req.body;
        const updatedTour = await Tour.findByIdAndUpdate(id, {
            // $set: req.body                        
            $set: {
                ...rest,
                isVisible: typeof isVisible === 'boolean' ? isVisible : true,
                featured: typeof featured === 'boolean' ? featured : false
            }         
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
        const tour = await Tour.findById(id)
        .populate('reviews')
        .populate({
          path: 'country',
          select: 'name'
        })

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

        const total = await Tour.countDocuments();

        res.status(200).json({
            success: true, 
            count: tours.length,
            total, 
            message: 'Successful',
            data: tours,
        })
    } catch (err) { 
        res.status(404).json({ 
            success: false, 
            message: 'not found'})
     }
}

//get all tours visible
export const getAllVisibleTours = async (req, res) => {
       //for pagination 
    const page = parseInt(req.query.page)

    try {
        const tours = await Tour.find({ isVisible: true })
            .populate('reviews')
            .skip(page*8)
            .limit(8)

        const total = await Tour.countDocuments({ isVisible: true });

        res.status(200).json({
            success: true, 
            count: tours.length,
            total, 
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
        const tourName = req.query.tourName || "";

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
            "title": { $regex: tourName, $options: "i" },
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

//get country by name
export const getCountryByName = async(req,res) => {
    const name = req.query.name;
    const query = {
        name: { $regex: name, $options: 'i' }
    }
    try {
        const countries = await Country.find(query);
        if (!countries) {
            return res.status(404).json({ success: false, message: 'Country not found' });
        }
        res.status(200).json({ success: true, data: countries });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const getTourCountsBySubregion = async (req, res) => {
  try {
    const tours = await Tour.find().populate("country");

    const counts = {};

    tours.forEach(tour => {
      const subregion = tour.country?.subregion || "Unknown";
      counts[subregion] = (counts[subregion] || 0) + 1;
    });

    const result = Object.entries(counts).map(([subregion, count]) => ({
      subregion,
      count,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
