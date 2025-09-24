const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  delivery: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Delivery", 
    required: true 
  },
  driver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Driver", 
    required: true 
  },
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Vehicle", 
    required: true 
  },
  assignedAt: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ["Assigned", "Ongoing", "Completed", "Cancelled"], 
    default: "Assigned" 
  },
  startedAt: { type: Date },
  completedAt: { type: Date }
}, { 
  timestamps: true 
});

// Add index for better query performance
assignmentSchema.index({ delivery: 1 });
assignmentSchema.index({ driver: 1 });
assignmentSchema.index({ status: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);