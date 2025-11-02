import express from "express";
import { getAllNotifications, markAsRead, deleteNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getAllNotifications);          
router.patch("/read/:id", markAsRead);        
router.delete("/:id", deleteNotification);    

export default router;
