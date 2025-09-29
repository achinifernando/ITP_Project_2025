const mongoose = require("mongoose");

const deductionSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  type: {
    type: String,
    enum: ["epf", "etf", "tax", "loan", "noPayLeave", "other"],
    required: true,
  },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // e.g., "2025-09"
}, { timestamps: true });

const Deduction = mongoose.model("deductions", deductionSchema);

module.exports = Deduction;
