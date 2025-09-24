import Employee from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Otp from "../models/otp.js";
import nodemailer from "nodemailer";

// ============================
// Helper: Generate a 6-digit OTP
// ============================
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ============================
// Configure mail transporter
// ============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================
// Send OTP
// ============================
export const sendOtp = async (req, res) => {
  const { employeeId, action } = req.body; // action = "time-in" | "time-out"
  if (!employeeId || !action) {
    return res.status(400).json({ message: "employeeId and action required" });
  }

  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // If action is time-out, check if there's an open attendance session
    if (action === "time-out") {
      const open = await Attendance.findOne({ employeeId, timeOut: null }).sort({ timeIn: -1 });
      if (!open) return res.status(400).json({ message: "No active time-in found to time-out" });
    }

    // Generate OTP (valid for 2 minutes)
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Clear old OTPs for this employee
    await Otp.deleteMany({ employeeId });
    await Otp.create({ employeeId, otp, expiresAt, action });

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: employee.email,
      subject: `Your Attendance OTP (${action})`,
      text: `Your OTP for ${action} is ${otp}. It is valid for 2 minutes.`,
    });

    res.json({ message: "OTP sent successfully. Check your email." });
  } catch (err) {
    console.error("Error in sendOtp:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================
// Verify OTP
// ============================
export const verifyOtp = async (req, res) => {
  const { employeeId, otp, action } = req.body;
  if (!employeeId || !otp || !action) {
    return res.status(400).json({ message: "employeeId, otp and action required" });
  }

  try {
    const record = await Otp.findOne({ employeeId, otp, action });
    if (!record) return res.status(400).json({ message: "Invalid OTP or action" });

    // Check expiry
    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ employeeId });
      return res.status(400).json({ message: "OTP expired" });
    }

    // Handle time-in
    if (action === "time-in") {
      await Attendance.create({ employeeId, timeIn: new Date() });
      await Otp.deleteMany({ employeeId });
      return res.json({ message: "Time-In recorded successfully" });
    }

    // Handle time-out
    if (action === "time-out") {
      const open = await Attendance.findOne({ employeeId, timeOut: null }).sort({ timeIn: -1 });
      if (!open) {
        await Otp.deleteMany({ employeeId });
        return res.status(400).json({ message: "No open time-in found to time-out" });
      }
      open.timeOut = new Date();
      await open.save();
      await Otp.deleteMany({ employeeId });
      return res.json({ message: "Time-Out recorded successfully" });
    }

    return res.status(400).json({ message: "Unknown action" });
  } catch (err) {
    console.error("Error in verifyOtp:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================
// Get today attendance summary
// ============================
export const getTodayAttendanceSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalEmployees = await Employee.countDocuments();
    const present = await Attendance.countDocuments({ 
      date: { $gte: today },
      status: 'present'
    });
    const absent = totalEmployees - present;
    const late = await Attendance.countDocuments({
      date: { $gte: today },
      status: 'late'
    });

    res.json({ total: totalEmployees, present, absent, late });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

