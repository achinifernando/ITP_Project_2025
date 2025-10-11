const express = require("express");
const router = express.Router();
const User = require("../../models/AttendenceTaskModel/User");
const Attendance = require("../../models/AttendenceTaskModel/Attendance");
const Allowance = require("../../models/CompanyManagerModels/allowance");
const Deduction = require("../../models/CompanyManagerModels/deduction");
const Payroll = require("../../models/CompanyManagerModels/payroll");
const SalaryInfo = require("../../models/CompanyManagerModels/salaryInfo");
const { protectUser, companyManager } = require("../../middleware/authMiddleware");

// Helper: calculate total and stats
const calculatePayrollData = (attendances) => {
  const totalHours = attendances.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
  const overtimeHours = attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
  const daysPresent = attendances.filter(a => a.status === "present").length;
  const daysLate = attendances.filter(a => a.status === "late").length;
  const daysAbsent = attendances.filter(a => a.status === "absent").length;

  return { totalHours, overtimeHours, daysPresent, daysLate, daysAbsent };
};

// Generate payroll for one user
const generateUserPayroll = async (user, monthString) => {
  const salaryInfo = await SalaryInfo.findOne({ employeeId: user._id });

  const attendances = await Attendance.find({
    employeeId: user._id,
    date: {
      $gte: new Date(`${monthString}-01`),
      $lte: new Date(new Date(`${monthString}-01`).getFullYear(), new Date(`${monthString}-01`).getMonth() + 1, 0, 23, 59, 59),
    },
  });

  const { totalHours, overtimeHours, daysPresent, daysLate, daysAbsent } = calculatePayrollData(attendances);

  const allowances = await Allowance.find({ employeeId: user._id, month: monthString });
  const deductions = await Deduction.find({ employeeId: user._id, month: monthString });

  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

  let basicSalary = 0, overtimePay = 0;

  if (salaryInfo) {
    if (user.role === "member") {
      basicSalary = (salaryInfo.hourlyRate || 0) * totalHours;
      overtimePay = (salaryInfo.overtimeRate || 0) * overtimeHours;
    } else {
      basicSalary = salaryInfo.basicSalary || 0;
      overtimePay = (salaryInfo.overtimeRate || 0) * overtimeHours;
    }
  }

  const grossPay = basicSalary + overtimePay + totalAllowances;
  const netPay = grossPay - totalDeductions;

  const payrollRecord = await Payroll.findOneAndUpdate(
    { employeeId: user._id, month: monthString },
    { employeeId: user._id, month: monthString, basicSalary, totalAllowances, totalDeductions, overtimePay, netSalary: netPay },
    { upsert: true, new: true }
  ).populate("employeeId", "name role");

  return {
    ...payrollRecord.toObject(),
    daysPresent,
    daysLate,
    daysAbsent,
    totalHours,
    overtimeHours,
    grossPay,
    netPay,
  };
};

// POST /generate
router.post("/generate", protectUser, async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    if (!month || !year) return res.status(400).json({ message: "Month and year are required" });

    const monthString = `${year}-${String(month).padStart(2, "0")}`;
    const users = employeeId ? [await User.findById(employeeId)] : await User.find();
    if (!users.length) return res.status(404).json({ message: "No employees found" });

    const payrolls = [];
    for (const user of users) {
      if (!user) continue;
      const payroll = await generateUserPayroll(user, monthString);
      payrolls.push(payroll);
    }

    res.json({ message: "Payroll generated successfully", payrolls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /my-payroll
router.get("/my-payroll", protectUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const currentMonthString = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    const salaryInfo = await SalaryInfo.findOne({ employeeId: userId });
    const currentPayroll = await Payroll.findOne({ employeeId: userId, month: currentMonthString });
    const payrollHistory = await Payroll.find({ employeeId: userId }).sort({ month: -1 }).limit(6);

    const attendances = await Attendance.find({
      employeeId: userId,
      date: {
        $gte: new Date(`${currentMonthString}-01`),
        $lte: new Date(new Date(`${currentMonthString}-01`).getFullYear(), new Date(`${currentMonthString}-01`).getMonth() + 1, 0, 23, 59, 59),
      },
    });
    const currentMonthStats = calculatePayrollData(attendances);

    const allowances = await Allowance.find({ employeeId: userId, month: currentMonthString });
    const deductions = await Deduction.find({ employeeId: userId, month: currentMonthString });

    res.json({
      salaryInfo: salaryInfo || null,
      currentPayroll: currentPayroll || null,
      payrollHistory: payrollHistory || [],
      currentMonthStats,
      allowances: allowances || [],
      deductions: deductions || [],
    });
  } catch (err) {
    console.error("❌ Error fetching payroll:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
