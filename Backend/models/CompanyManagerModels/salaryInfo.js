const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  basicSalary: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  overtimeRate: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("SalaryInfo", salarySchema);
