const express = require("express");
const router = express.Router();
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
router.get("/pending", getPendingDeliveries);
router.get("/deliveries", getAllDeliveries);

// Assignment routes (NEW)
router.get("/", getAllAssignments);
router.get("/status/:status", getAssignmentsByStatus);
router.get("/:id", getAssignmentById);
router.delete("/:id", deleteAssignment);

// Assignment action routes
router.post("/assign/:id", assignDelivery);
router.post("/start/:id", startDelivery);
router.put("/status/:id", updateDeliveryStatus);

module.exports = router;