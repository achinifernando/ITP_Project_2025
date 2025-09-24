// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true }, // Employee ID from QR code
  date: { type: Date, default: Date.now }, // timestamp when marked
  timeIn: { type: Date, default: null },
  timeOut: { type: Date, default: null },
  status: { type: String, enum: ['present', 'late', 'absent'], default: 'present' }
}, { timestamps: true });



module.exports = mongoose.model('attendance', attendanceSchema);
