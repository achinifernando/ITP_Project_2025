const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true }, // e.g., ABC-1234
  type: { type: String, required: true }, // Truck, Van, Mini Truck
  capacity: { type: Number, required: true }, // kg/ton
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
