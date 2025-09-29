const mongoose = require("mongoose");

const allowanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  type: {
    type: String,
    enum: ["transport", "meal", "bonus", "medical", "other"],
    required: true,
  },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // e.g., "2025-09"
}, { timestamps: true });

const Allowance = mongoose.model("allowances", allowanceSchema);

module.exports = Allowance;
