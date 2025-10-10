const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users", 
    required: true 
  },

  month: { type: String, required: true },  // Format: "YYYY-MM" e.g. "2025-10"

  // Salary breakdown
  basicSalary: { type: Number, default: 0 },
  totalAllowances: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  overtimePay: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },

}, { timestamps: true });

const Payroll = mongoose.model("payrolls", payrollSchema);

module.exports = Payroll;
