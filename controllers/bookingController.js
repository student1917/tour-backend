import Booking from "../models/Booking.js"
import mongoose from 'mongoose';
import Payment from '../models/Payment.js';


//create new booking
export const createBooking = async(req,res)=>{

    const userId = req.user._id
    const newBooking = new Booking({...req.body, userId})
    
    // const newBooking = new Booking(req.body)

    try{
        const savedBooking = await newBooking.save()

        res.status(200).json({
            success:true,
            message: 'Your tour is booked',
            data: savedBooking,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success:false,
            message: 'internal server error',            
        })
    }
}

//get single booking
export const getBooking = async(req,res)=>{
    const id = req.params.id
    
    try {
        const book = await Booking.findById(id)

        res.status(200).json({
            success:true,
            message: 'sucessful',
            data: book,
        })
    } catch (err) {
        res.status(404).json({
            success:false,
            message: 'not found',            
        })
    }
    
}

//get all booking
export const getAllBooking = async(req,res)=>{
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10;
    try {
        const book = await Booking.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

        const total = await Booking.countDocuments()
        
        res.status(200).json({
            success:true,
            message: 'sucessful',
            data: book,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success:false,
            message: 'internal server error',            
        })
    }
    
}

// Get all bookings for a user
export const getUserBookings = async (req, res) => {
  const userId = req.params.userId; // userId từ params
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const bookings = await Booking.aggregate([
      { $match: { userId: String(userId) } },

      {
        $lookup: {
          from: "payments",        
          let: { paymentId: "$paymentId", bookingId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$$paymentId"] },      
                    { $eq: ["$bookingId", "$$bookingId"] } 
                  ]
                }
              }
            }
          ],
          as: "payment"
        }
      },

      { $addFields: { payment: { $arrayElemAt: ["$payment", 0] } } },

      {
        $project: {
          _id: 1,
          tourName: 1,
          fullName: 1,
          guestSize: 1,
          phone: 1,
          bookAt: 1,
          createdAt: 1,
          status: 1,
          amount: { $ifNull: ["$payment.amount", 0] },
          paymentMethod: { $ifNull: ["$payment.paymentMethod", "N/A"] },
          paymentStatus: { $ifNull: ["$payment.status", "pending"] },
        }
      },

      { $sort: { createdAt: -1 } },

      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await Booking.countDocuments({ userId: String(userId) });

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: bookings
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong."
    });
  }
};