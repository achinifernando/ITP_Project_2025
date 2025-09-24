
const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, getTodayAttendanceSummary } = require('../controllers/attendanceController');

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/today", getTodayAttendanceSummary);


module.exports = router; 