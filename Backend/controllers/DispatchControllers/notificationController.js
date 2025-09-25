// controllers/notificationController.js
const Notification = require("../../models/DispatchModels/Notification");

// Create (send) a notification
const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, relatedDelivery } = req.body;

    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      relatedDelivery: relatedDelivery || null,
    });

    await notification.save();
    res.status(201).json({ message: "Notification created", notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createNotification, getUserNotifications, markAsRead };