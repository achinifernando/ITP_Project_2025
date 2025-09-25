const express = require("express");
const Attendance = require("../../models/AttendenceTaskModel/Attendance");
const router = express.Router();

// OFFICE TIMINGS (can later move to config/DB)
const OFFICE_START_HOUR = 9;   // 9 AM
const STANDARD_WORK_HOURS = 8; // 8 hours per day

// 1. Mark attendance (Time In)
router.post("/time-in", async (req, res) => {
  try {
    const { employeeId } = req.body;

    const now = new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if already marked
    let attendance = await Attendance.findOne({ employeeId, date: dateOnly });

    if (attendance) {
      return res.status(400).json({ message: "Already marked Time In" });
    }

    // Determine status
    const officeStart = new Date(dateOnly);
    officeStart.setHours(OFFICE_START_HOUR, 0, 0, 0);

    let status = "present";
    if (now > officeStart) {
      status = "late";
    }

    attendance = new Attendance({
      employeeId,
      date: dateOnly,
      timeIn: now,
      status
    });

    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Mark Time Out
router.post("/time-out", async (req, res) => {
  try {
    const { employeeId } = req.body;

    const now = new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let attendance = await Attendance.findOne({ employeeId, date: dateOnly });

    if (!attendance) {
      return res.status(404).json({ message: "No Time In record found for today" });
    }

    if (attendance.timeOut) {
      return res.status(400).json({ message: "Already marked Time Out" });
    }

    attendance.timeOut = now;

    // Calculate worked hours
    const hoursWorked = (attendance.timeOut - attendance.timeIn) / (1000 * 60 * 60);
    attendance.hoursWorked = parseFloat(hoursWorked.toFixed(2));

    // Overtime
    if (hoursWorked > STANDARD_WORK_HOURS) {
      attendance.overtimeHours = parseFloat((hoursWorked - STANDARD_WORK_HOURS).toFixed(2));
    } else {
      attendance.overtimeHours = 0;
    }

    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get all attendance for a user
router.get("/user/:employeeId", async (req, res) => {
  try {
    const records = await Attendance.find({ employeeId: req.params.employeeId })
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get attendance for all users (for HR/Admin)
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("employeeId", "name email role")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
