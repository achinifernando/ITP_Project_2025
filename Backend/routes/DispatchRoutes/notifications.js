const express = require("express");
const router = express.Router();
const { 
  createNotification, 
  getUserNotifications, 
  markAsRead 
} = require("../../controllers/DispatchControllers/notificationController");
const { protectUser, dispatchManager } = require("../../middleware/authMiddleware");

// Create (send) a notification
router.post("/",protectUser, createNotification);

// Get all notifications for a specific user
router.get("/:userId",protectUser, getUserNotifications);

// Mark notification as read
router.put("/read/:id",protectUser, markAsRead);

module.exports = router;
