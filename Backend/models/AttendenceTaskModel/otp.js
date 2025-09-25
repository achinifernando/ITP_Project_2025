// models/otp.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  otp: { type: String, required: true },
  action: { type: String, required: true }, // "time-in" or "time-out"
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("Otp", otpSchema);