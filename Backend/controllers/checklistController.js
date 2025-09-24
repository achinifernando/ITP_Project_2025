const ChecklistTemplate = require("../models/ChecklistTemplate");

// @desc Create a new checklist template
const createTemplate = async (req, res) => {
  try {
    const { name, items } = req.body;

    const newTemplate = new ChecklistTemplate({ name, items });
    await newTemplate.save();

    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get all checklist templates
const getTemplates = async (req, res) => {
  try {
    const templates = await ChecklistTemplate.find();
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get a single template by ID
const getTemplateById = async (req, res) => {
  try {
    const template = await ChecklistTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });

    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Delete a template
const deleteTemplate = async (req, res) => {
  try {
    const template = await ChecklistTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });

    res.status(200).json({ message: "Template deleted", template });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createTemplate, getTemplates, getTemplateById, deleteTemplate };

