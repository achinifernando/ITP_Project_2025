const express = require("express");
const { protectUser, adminOnly } = require("../../middleware/authMiddleware");
const {
  exportTasksReport,
  exportUsersReport,
} = require("../../controllers/TaskControllers/reportController");
const router = express.Router();

router.get("/export/tasks", protectUser, adminOnly, exportTasksReport); //export all tasks as Excel/PDF
router.get("/export/users", protectUser, adminOnly, exportUsersReport); //export user-task report

module.exports = router;
