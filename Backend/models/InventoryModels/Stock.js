import mongoose from 'mongoose';
const { Schema } = mongoose;


const stockSchema = new Schema(
  {
    itemName: { type: String, required: true },
    // Store simple free-text category (e.g., "Beverages", "Hardware")
    category: { type: String, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String }, // "kg", "liters", "pieces"
    threshold: { type: Number, default: 0 },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    expiryDate: { type: Date }, // optional
    lastUpdated: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

stockSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

export default mongoose.model('Stock', stockSchema);
