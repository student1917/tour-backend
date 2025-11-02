import mongoose from "mongoose";
import Visit from "../models/Visit.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js"; 
import Review from "../models/Review.js";

export const trackVisit = async (req, res) => {
  try {
    const { tourId } = req.params;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const cutoff = new Date(Date.now() -  60 * 60 * 1000);
    // const cutoff = new Date(Date.now() - 0);


    const query = { ip, date: { $gte: cutoff } };
    if (tourId) {
      query.tour = new mongoose.Types.ObjectId(tourId);
    } else {
      query.tour = null;
    }

    const exists = await Visit.findOne(query);

    if (!exists) {
      await Visit.create({
        tour: tourId ? new mongoose.Types.ObjectId(tourId) : null,
        ip,
        userAgent,
        date: new Date(),
      });
    }

    res.status(200).json({ message: "Visit tracked successfully" });
  } catch (error) {
    console.error("Error tracking visit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getVisitStats = async (req, res) => {
  try {
    const [totalVisits, todayVisits, topTours] = await Promise.all([
      Visit.countDocuments(),
      Visit.countDocuments({
        date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Visit.aggregate([
        { $match: { tour: { $ne: null } } },
        { $group: { _id: "$tour", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "tours_v2", 
            localField: "_id",
            foreignField: "_id",
            as: "tour"
          }
        },
        { $unwind: "$tour" },
        {
          $project: {
            _id: 0,
            tourId: "$tour._id",
            tourName: "$tour.title",
            views: 1
          }
        }
      ])
    ]);

    res.json({ totalVisits, todayVisits, topTours });
  } catch (err) {
    console.error("Error fetching visit stats:", err);
    res.status(500).json({ message: "Error fetching visit stats" });
  }
};

export const getStatsSummary = async (req, res) => {
  try {
    const [totalTours, totalVisits, totalUsers, totalReviews] = await Promise.all([
      Tour.countDocuments(),
      Visit.countDocuments(),
      User.countDocuments(),
      Review.countDocuments()
    ]);

    res.json({ totalTours, totalVisits, totalUsers, totalReviews });
  } catch (err) {
    console.error("Error fetching stats summary:", err);
    res.status(500).json({ message: "Error fetching stats summary" });
  }
};

export const getMonthlyVisitStats = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); 

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

    const startOfPrevMonth = new Date(year, month - 1, 1);
    const endOfPrevMonth = new Date(year, month, 0, 23, 59, 59);

    const currentMonthData = await Visit.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: {
          _id: { $dayOfMonth: "$date" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const prevMonthData = await Visit.aggregate([
      { $match: { date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } } },
      { $group: {
          _id: { $dayOfMonth: "$date" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysPrevMonth = new Date(year, month, 0).getDate();

    const currentMonth = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const record = currentMonthData.find(d => d._id === day);
      return record ? record.count : 0;
    });

    const previousMonth = Array.from({ length: daysPrevMonth }, (_, i) => {
      const day = i + 1;
      const record = prevMonthData.find(d => d._id === day);
      return record ? record.count : 0;
    });

    res.json({
      days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
      currentMonth,
      previousMonth,
    });

  } catch (err) {
    console.error("Error fetching monthly visit stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};