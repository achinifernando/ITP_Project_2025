const express = require("express");
const { protect, adminOnly, hrManagerOrAdmin } = require("../middleware/authMiddleware");
const { 
  exportTasksReport, 
  exportUsersReport,
  exportAttendanceReport,
  exportEmployeeReport // Make sure this matches exactly
} = require("../controllers/reportController");

const router = express.Router();

router.get("/export/tasks", protect, adminOnly, exportTasksReport);
router.get("/export/users", protect, adminOnly, exportUsersReport);
router.get("/export/attendance", protect, hrManagerOrAdmin, exportAttendanceReport);
router.get("/export/employees", protect, hrManagerOrAdmin, exportEmployeeReport); // Fixed function name

module.exports = router;
