const mongoose = require("mongoose");

const schema = mongoose.Schema;
const QuotationRequestSchema = new schema({
//id(primary key) will be automtically created when inserting data
    

    clientID:{ type: mongoose.Schema.Types.ObjectId, ref: "clients", required: true },
    lorryCategory:{ type: mongoose.Schema.Types.ObjectId, ref: "lorrycategories", required: true},
    lorryType:{ type: mongoose.Schema.Types.ObjectId, ref: "lorrytypes", required: true},
    lorryModel: {type: mongoose.Schema.Types.ObjectId, ref: "lorrymodels", required: true },
    customFeatures: { type: String }, 
  quantity: { type: Number, default: 1 },

  expectedDeliveryDate: { type: Date }, 

  status: {type: String,enum: ["Pending", "Reviewed", "Quote_Sent", "Rejected","Accepted"],default: "Pending",},

  quotedPrice: { type: Number }, // admin fills in after review
  remarks: { type: String }, // admin notes (optional)

  createdAt: { type: Date, default: Date.now },
});

const QuotationRequest = mongoose.model("quotationrequest", QuotationRequestSchema);

module.exports = QuotationRequest;