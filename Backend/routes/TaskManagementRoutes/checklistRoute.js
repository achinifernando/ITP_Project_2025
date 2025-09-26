const express = require("express");
const { protectUser, adminOnly } = require("../../middleware/authMiddleware");
const {
  createTemplate,
  getTemplates,
  getTemplateById,
  deleteTemplate,
} = require("../../controllers/TaskControllers/checklistController");

const router = express.Router();

// Create a new checklist template (Admin only)
router.post("/", protectUser, adminOnly, createTemplate);

// Get all templates
router.get("/", protectUser, getTemplates);

// Get one template by ID
router.get("/:id", protectUser, getTemplateById);

// Delete a template (Admin only)
router.delete("/:id", protectUser, adminOnly, deleteTemplate);

module.exports = router;

