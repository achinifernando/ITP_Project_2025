const express = require("express");
const { protect, adminOnly } = require("../../middleware/authMiddleware");
const {
  createTemplate,
  getTemplates,
  getTemplateById,
  deleteTemplate,
} = require("../../controllers/TaskControllers/checklistController");

const router = express.Router();

// Create a new checklist template (Admin only)
router.post("/", protect, adminOnly, createTemplate);

// Get all templates
router.get("/", protect, getTemplates);

// Get one template by ID
router.get("/:id", protect, getTemplateById);

// Delete a template (Admin only)
router.delete("/:id", protect, adminOnly, deleteTemplate);

module.exports = router;

