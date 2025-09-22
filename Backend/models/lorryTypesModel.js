const mongoose = require("mongoose");

const lorrySchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "lorrycategories", // Reference to the categories collection
    required: true
  },
  typeName: {
    type: String,
    required: true
  },
  frontEnd: String,
  subFrame: String,
  rearFrame: String,
  bumper: String,
  door: String,
  roof: String,
  floor: String,
  wallConstuction: String,
  images: { // multiple images
    type: [String],
    required: true
  }
});

const LorryType = mongoose.model("lorrytypes", lorrySchema);
module.exports = LorryType;
