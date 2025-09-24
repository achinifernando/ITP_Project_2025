// models/Leave.js
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({ 
  employeeId: {
      type: mongoose.Schema.Types.ObjectId, ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Casual", "Sick", "Annual"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
 );

module.exports = mongoose.model("Leave", leaveSchema);
