const mongoose = require("mongoose"); 

const schema = mongoose.Schema; 
const meetingSchema = new schema({
 clientName: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected','completed'],
    default: 'pending'
  },
  googleEventId: String,
  meetingLink: String
}, { timestamps: true });
const Meeting = mongoose.model("meetings", meetingSchema);
module.exports = Meeting;