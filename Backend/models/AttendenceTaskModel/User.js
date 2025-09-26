const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  employeeId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String, default: null },
  role: { 
    type: String, 
    enum: ["admin", "hr_manager", "member","company_manager","inventory_manager","dispatch_manager"], 
    default: "member" 
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);