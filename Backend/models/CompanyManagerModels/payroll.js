const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users", 
    required: true 
  },

  month: { type: Number, required: true },  // e.g. 9 for September
  year: { type: Number, required: true },   // e.g. 2025

  // Salary breakdown
  basicSalary: { type: Number, default: 0 },    // from User model (for office workers)
  hourlyRate: { type: Number, default: 0 },     // from User model (for workshop workers)
  overtimeRate: { type: Number, default: 0 },   // from User model (common)

  totalHours: { type: Number, default: 0 },     // from attendance
  overtimeHours: { type: Number, default: 0 },  // from attendance
  daysPresent: { type: Number, default: 0 },
  daysAbsent: { type: Number, default: 0 },
  daysLate: { type: Number, default: 0 },

  grossPay: { type: Number, default: 0 },       // before deductions
  deductions: { type: Number, default: 0 },     // (optional: tax, leaves, etc.)
  netPay: { type: Number, default: 0 },         // final salary

}, { timestamps: true });

const Payroll = mongoose.model("payrolls", payrollSchema);

module.exports = Payroll;
