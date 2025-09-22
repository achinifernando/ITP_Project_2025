const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "clients", required: true },
  requestId: {type: mongoose.Schema.Types.ObjectId,ref: "quotationrequest",required: true},
   quotationId: {type: mongoose.Schema.Types.ObjectId,ref: 'quotation',required: true},
  amount: {
    type: Number,
    required: true
  },
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
