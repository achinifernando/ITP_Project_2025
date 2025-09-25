const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "quotationrequest",
    required: true,
  },
  clientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "clients",
    required: true,
  },
  companyName: { type: String, required: true },
  companyAddress: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  lorryCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "lorrycategories",
    required: true,
  },
  lorryType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "lorrytypes",
    required: true,
  },
  lorryModel: {  type: mongoose.Schema.Types.ObjectId,ref: "lorrymodels", },
  items: [
    {
       _id: { type: mongoose.Schema.Types.ObjectId, ref: "stock" },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, default: 0.0 },
    },
  ],
  totalPrice: { type: Number, required: true, default: 0.0 },
  remarks: { type: String },
  acceptedAt: { type: Date },
validUntil :{ type: Date }, 
  status: {
    type: String,
    enum: ["Quote_Sent", "Accepted", "Rejected"],
    default: "pending"
  }
}, { 
  timestamps: true,
});


const Quotation = mongoose.model("quotation", quotationSchema);
module.exports = Quotation;
