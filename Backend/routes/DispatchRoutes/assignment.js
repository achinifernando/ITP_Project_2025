const express = require("express");
const router = express.Router();
const { protectUser, dispatchManager } = require("../../middleware/authMiddleware");
const { 
  getPendingDeliveries,
  getAllDeliveries,
  getAllAssignments,
  getAssignmentsByStatus,
  getAssignmentById,
  assignDelivery,
  startDelivery,
  updateDeliveryStatus,
  updateAssignment,
  removeAssignment,
  deleteAssignment
} = require("../../controllers/DispatchControllers/assignmentController");

// Delivery routes
router.get("/pending",protectUser, getPendingDeliveries);
router.get("/deliveries",protectUser, getAllDeliveries);

// Assignment routes
router.get("/",protectUser, getAllAssignments);
router.get("/status/:status",protectUser, getAssignmentsByStatus);

//Put specific routes BEFORE parameterized routes
router.post("/assign/:id",protectUser, assignDelivery);
router.post("/start/:id",protectUser, startDelivery);
router.put("/status/:id",protectUser, updateDeliveryStatus);
router.delete("/remove/:id",protectUser, removeAssignment);

//These should come after all specific routes
router.get("/:id",protectUser, getAssignmentById);
router.put("/:id",protectUser, updateAssignment);
router.delete("/:id",protectUser, deleteAssignment);

module.exports = router;