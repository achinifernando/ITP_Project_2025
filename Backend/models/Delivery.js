const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const deliverySchema = new mongoose.Schema({
  orderId: { type: String, default: () => uuidv4(), unique: true },
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  contactPhone: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  distance: { type: Number, default: 0 },
  status: {
    type: String,
enum: ["Pending", "Assigned", "Ongoing", "Completed", "Cancelled"],
    default: "Pending",
  },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
  assignedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Delivery", deliverySchema);
