const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../../controllers/DispatchControllers/vehicleController");
const { protectUser, dispatchManager } = require("../../middleware/authMiddleware");

// Validation rules
const vehicleValidation = [
  body("vehicleNumber").notEmpty().withMessage("Vehicle number is required"),
  body("type").isIn(["Truck", "Container", "Mini Truck"]).withMessage("Valid vehicle type is required"),
  body("capacity").isNumeric().withMessage("Vehicle capacity must be a number"),
];

// Routes
router.get("/",protectUser, getAllVehicles);
router.post("/",protectUser, vehicleValidation, addVehicle);
router.put("/:id",protectUser, updateVehicle);
router.delete("/:id",protectUser, deleteVehicle);

module.exports = router;
