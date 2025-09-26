const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
    required: true,
    
  },
  timeIn: {
    type: Date,
    required: true
  },
  timeOut: {
    type: Date
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent'],
    default: 'present'
  },
  hoursWorked: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate hours worked before saving
attendanceSchema.pre('save', function(next) {
  if (this.timeOut) {
    const diffMs = this.timeOut - this.timeIn;
    this.hoursWorked = (diffMs / (1000 * 60 * 60)).toFixed(2);
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);