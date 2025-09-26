// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { 
  sendOtp, 
  verifyOtp, 
  getTodayAttendanceSummary, 
  getAllAttendance,
  getEmployeeAttendance 
} = require('../../controllers/AttendenceController/attendanceController.js');

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/today", getTodayAttendanceSummary);
router.get("/all", getAllAttendance);
router.get("/employee/:employeeId", getEmployeeAttendance);

module.exports = router;