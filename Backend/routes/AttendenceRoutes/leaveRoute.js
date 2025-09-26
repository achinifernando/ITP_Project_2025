const express = require("express");
const { protectUser, hrManagerOrAdmin } = require("../../middleware/authMiddleware");
const {
  getAllLeaves,
  createLeave,
  updateLeaveStatus,
  getMyLeaves
} = require("../../controllers/AttendenceController/leaveController");

const router = express.Router();

// Match the frontend API paths
router.get("/my", protectUser, getMyLeaves); // GET /api/leaves/my
router.get("/all", protectUser, hrManagerOrAdmin, getAllLeaves); // GET /api/leaves/all
router.post("/", protectUser, createLeave); // POST /api/leaves
router.put("/:id/status", protectUser, hrManagerOrAdmin, updateLeaveStatus); // PUT /api/leaves/:id/status

module.exports = router;