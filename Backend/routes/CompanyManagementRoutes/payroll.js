const express = require("express");
const router = express.Router();
const User = require("../../models/AttendenceTaskModel/User");
const Attendance = require("../../models/AttendenceTaskModel/Attendance");
const Allowance = require("../../models/CompanyManagerModels/allowance");
const Deduction = require("../../models/CompanyManagerModels/deduction");
const Payroll = require("../../models/CompanyManagerModels/payroll");
const SalaryInfo = require("../../models/CompanyManagerModels/salaryInfo");
const { protectUser, companyManager } = require("../../middleware/authMiddleware");


router.post("/generate",protectUser, async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    // Create YYYY-MM string
    const monthString = `${year}-${String(month).padStart(2, "0")}`;

    const start = new Date(`${monthString}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

    const users = employeeId
      ? [await User.findById(employeeId)]
      : await User.find();

    if (!users.length) return res.status(404).json({ message: "No employees found" });

    const payrolls = [];

    for (const user of users) {
      if (!user) continue;

      // Fetch salary info
      const salaryInfo = await SalaryInfo.findOne({ employeeId: user._id });

      const attendances = await Attendance.find({
        employeeId: user._id,
        date: { $gte: start, $lte: end },
      });

      const totalHours = attendances.reduce((acc, a) => acc + (a.hoursWorked || 0), 0);
      const overtimeHours = attendances.reduce((acc, a) => acc + (a.overtimeHours || 0), 0);

      const daysPresent = attendances.filter(a => a.status === "present").length;
      const daysLate = attendances.filter(a => a.status === "late").length;
      const daysAbsent = attendances.filter(a => a.status === "absent").length;

      const allowances = await Allowance.find({ employeeId: user._id, month: monthString });
      const deductions = await Deduction.find({ employeeId: user._id, month: monthString });

      const totalAllowances = allowances.reduce((acc, a) => acc + a.amount, 0);
      const totalDeductions = deductions.reduce((acc, d) => acc + d.amount, 0);

      let basicSalary = 0;
      let overtimePay = 0;

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
        {
          employeeId: user._id,
          month: monthString,
          basicSalary,
          totalAllowances,
          totalDeductions,
          overtimePay,
          netSalary: netPay,
        },
        { upsert: true, new: true }
      ).populate("employeeId", "name role");

      payrolls.push({
        ...payrollRecord.toObject(),
        daysPresent,
        daysLate,
        daysAbsent,
        totalHours,
        overtimeHours,
        grossPay,
        netPay,
      });
    }

    res.json({ message: "Payroll generated successfully", payrolls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
