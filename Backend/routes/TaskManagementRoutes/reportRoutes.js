import express from "express";
import { protectUser, adminOnly } from "../../middleware/authMiddleware.js";
import {
  exportTasksReport,
  exportUsersReport,
  exportAttendanceReport,
  exportEmployeeReport
} from "../../controllers/AttendenceController/reportController.js";

const router = express.Router();

// Task Management Reports
router.get("/export/tasks", protectUser, adminOnly, exportTasksReport); //export all tasks as Excel/PDF
router.get("/export/users", protectUser, adminOnly, exportUsersReport); //export user-task report

// Attendance Reports
router.get("/export/attendance", protectUser, exportAttendanceReport); //export attendance report
router.get("/export/employees", protectUser, exportEmployeeReport); //export employee report

export default router;
