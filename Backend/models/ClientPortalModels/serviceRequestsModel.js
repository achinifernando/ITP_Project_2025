const mongoose = require("mongoose");

const repairMaintenanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "clients", required: true },
  userName: String,
  phoneNumber: String,
  email: String,
  companyName: String,
  address: String,
  city: String,
  lorryModel: String,
  lorryNumber: String,
  serviceType: { type: String,required: true },
  issueDescription: String,
  preferredDate: Date,
  images: { // multiple images
    type: [String],
    required: true
  },
  status: { type: String, default: "Pending" },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "verified", "rejected"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("repairmaintenance", repairMaintenanceSchema);
