// models/ChecklistTemplate.js
const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true }
});

const checklistTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },  // e.g., "Maintenance Checklist"
  items: [checklistItemSchema]
});

module.exports = mongoose.model("ChecklistTemplate", checklistTemplateSchema);
