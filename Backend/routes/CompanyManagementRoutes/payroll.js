const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance");
const User = require("../models/employee");
const Payroll = require("../models/payroll");

// Constants
const STANDARD_WORK_HOURS = 8;

// Helper: calculate working days in a month (excluding weekends)
function getWorkingDays(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  let workingDays = 0;
  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) workingDays++; // skip Sunday(0) & Saturday(6)
  }
  return workingDays;
}

// Bulk Payroll Generation
router.post("/generate-all", async (req, res) => {
  try {
    const { month, year, deductions = 0, bonuses = 0 } = req.body; 
    const users = await User.find({ role: { $in: ["office_worker", "member"] } });

    const workingDaysInMonth = getWorkingDays(year, month);

    const payrollResults = await Promise.all(users.map(async (user) => {
      // Skip if payroll already exists
      const exists = await Payroll.findOne({ employeeId: user._id, month, year });
      if (exists) return exists;

      // Fetch attendance
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const attendanceRecords = await Attendance.find({
        employeeId: user._id,
        date: { $gte: startDate, $lte: endDate }
      });

      const daysPresent = attendanceRecords.length;
      const daysLate = attendanceRecords.filter(a => a.status === "late").length;
      const totalHours = attendanceRecords.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
      const overtimeHours = attendanceRecords.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

      // Calculate gross pay
      let grossPay = 0;
      if (user.role === "office_worker") {
        grossPay = user.basicSalary;
        const absentDays = workingDaysInMonth - daysPresent;
        grossPay -= (user.basicSalary / workingDaysInMonth) * absentDays;
      } else if (user.role === "member") {
        grossPay = (totalHours * user.hourlyRate) + (overtimeHours * user.overtimeRate);
      }

      // Apply optional deductions and bonuses
      grossPay = parseFloat(grossPay.toFixed(2));
      const netPay = parseFloat((grossPay - deductions + bonuses).toFixed(2));

      // Save payroll
      const payroll = await Payroll.create({
        employeeId: user._id,
        month,
        year,
        basicSalary: user.basicSalary,
        hourlyRate: user.hourlyRate,
        overtimeRate: user.overtimeRate,
        totalHours: parseFloat(totalHours.toFixed(2)),
        overtimeHours: parseFloat(overtimeHours.toFixed(2)),
        daysPresent,
        daysAbsent: workingDaysInMonth - daysPresent,
        daysLate,
        grossPay,
        deductions,
        netPay
      });

      return payroll;
    }));

    res.json({ message: "Payroll generated successfully", payrolls: payrollResults });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all payrolls
router.get("/", async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate("employeeId", "name email role")
      .sort({ year: -1, month: -1 });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
