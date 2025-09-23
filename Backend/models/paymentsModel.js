const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "clients", required: true },

  orderId: {type: mongoose.Schema.Types.ObjectId,ref: 'order', default: null},
  serviceRequestId: {type: mongoose.Schema.Types.ObjectId,ref: 'repairmaintenance', default: null},
  amount: {type: Number,required: true},
  receiptFile: {
    filename: String,
    originalName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'cancelled'],
    default: 'pending'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: Date,
  paymentMethod: {
    type: String,
    enum: ["bank_transfer", "cash", "cheque", "online"],
    required: true
  }, 
},{
  timestamps: true
});


module.exports = mongoose.model("payment", PaymentSchema);
