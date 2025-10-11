const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true }, // e.g., "2025-09"
  basicSalary: { type: Number, default: 0 },
  totalAllowances: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  overtimePay: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Payroll", payrollSchema);
