// routes/UserRoute.js
const express = require("express");
const router = express.Router();

// Import middleware
const { protectUser, adminOnly, hrManagerOrAdmin } = require("../../middleware/authMiddleware");

// Import controllers
const { createUser, getUsers, getUsersById, updateUser, deleteUser } = require("../../controllers/AttendenceController/attendanceController");

// =======================
// User Management Routes
// =======================

// Create a new user (Admin or HR Manager only)
router.post("/", protectUser, hrManagerOrAdmin, createUser);

// Get all users (Admin or HR Manager only)
router.get("/", protectUser, hrManagerOrAdmin, getUsers);

// Get a specific user (Admin, HR Manager, or the user themselves)
router.get("/:id", protectUser, getUsersById);

// Update a user (Admin, HR Manager, or the user themselves for their own profile)
router.put("/:id", protectUser, updateUser);

// Delete a user (Admin only)
router.delete("/:id", protectUser, adminOnly, deleteUser);

module.exports = router;