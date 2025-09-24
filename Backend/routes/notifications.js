const express = require("express");
const router = express.Router();
const { 
  createNotification, 
  getUserNotifications, 
  markAsRead 
} = require("../controllers/notificationController");

// Create (send) a notification
router.post("/", createNotification);

// Get all notifications for a specific user
router.get("/:userId", getUserNotifications);

// Mark notification as read
router.put("/read/:id", markAsRead);

module.exports = router;
