const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require("../../controllers/AttendenceController/authController");
const { protectUser, adminOnly } = require("../../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", protectUser, getUserProfile);
router.put("/profile", protectUser, updateUserProfile);

// Admin only routes
router.get("/admin/users", protectUser, adminOnly, async (req, res) => {
  // Admin functionality to manage users
});

module.exports = router;