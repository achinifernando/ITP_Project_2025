const express = require("express");
const { protect, hrManagerOrAdmin } = require("../middleware/authMiddleware");
const {
  getAllLeaves,
  createLeave,
  updateLeaveStatus,
  getMyLeaves
} = require("../controllers/leaveController");

const router = express.Router();

// Match the frontend API paths
router.get("/my", protect, getMyLeaves); // GET /api/leaves/my
router.get("/all", protect, hrManagerOrAdmin, getAllLeaves); // GET /api/leaves/all
router.post("/", protect, createLeave); // POST /api/leaves
router.put("/:id/status", protect, hrManagerOrAdmin, updateLeaveStatus); // PUT /api/leaves/:id/status

module.exports = router;