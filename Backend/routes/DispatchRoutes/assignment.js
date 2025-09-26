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
  deleteAssignment
} = require("../../controllers/DispatchControllers/assignmentController");

// Delivery routes
router.get("/pending",protectUser, getPendingDeliveries);
router.get("/deliveries",protectUser, getAllDeliveries);

// Assignment routes (NEW)
router.get("/",protectUser, getAllAssignments);
router.get("/status/:status",protectUser, getAssignmentsByStatus);
router.get("/:id",protectUser, getAssignmentById);
router.delete("/:id",protectUser, deleteAssignment);

// Assignment action routes
router.post("/assign/:id",protectUser, assignDelivery);
router.post("/start/:id",protectUser, startDelivery);
router.put("/status/:id",protectUser, updateDeliveryStatus);

module.exports = router;