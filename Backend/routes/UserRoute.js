// routes/UserRoute.js
const express = require("express");
const router = express.Router();

// Import middleware
const { protect, adminOnly, hrManagerOrAdmin } = require("../middleware/authMiddleware");

// Import controllers
const { createUser, getUsers, getUsersById, updateUser, deleteUser } = require("../controllers/UserController");

// =======================
// User Management Routes
// =======================

// Create a new user (Admin or HR Manager only)
router.post("/", protect, hrManagerOrAdmin, createUser);

// Get all users (Admin or HR Manager only)
router.get("/", protect, hrManagerOrAdmin, getUsers);

// Get a specific user (Admin, HR Manager, or the user themselves)
router.get("/:id", protect, getUsersById);

// Update a user (Admin, HR Manager, or the user themselves for their own profile)
router.put("/:id", protect, updateUser);

// Delete a user (Admin only)
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;