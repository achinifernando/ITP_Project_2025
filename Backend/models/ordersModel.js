const mongoose = require("mongoose");

const schema = mongoose.Schema;
const orderSchema = new schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "clients", required: true },
  userName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  companyName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  lorryCategory:{ type: mongoose.Schema.Types.ObjectId, ref: "lorrycategories", required: true},
  lorryType:{ type: mongoose.Schema.Types.ObjectId, ref: "lorrytypes", required: true},
  quantity: { type: Number, required: true },
  additionalFeatures: String,
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }

});
                            //file name,function name
const order =mongoose.model("order" ,orderSchema);

module.exports = order;