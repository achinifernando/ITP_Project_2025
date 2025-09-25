const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String,default: null},
    phone: { type: String },
    companyName: { type: String },
    companyAddress:{ type: String },
    
  },
  { timestamps: true });



module.exports = mongoose.model("clients", userSchema);
