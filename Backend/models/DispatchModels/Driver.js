// models/driverModel.js
const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model("Driver", driverSchema);

