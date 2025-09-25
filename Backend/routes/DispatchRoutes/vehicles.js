const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../../controllers/DispatchControllers/vehicleController");

// Validation rules
const vehicleValidation = [
  body("vehicleNumber").notEmpty().withMessage("Vehicle number is required"),
  body("type").isIn(["Truck", "Container", "Mini Truck"]).withMessage("Valid vehicle type is required"),
  body("capacity").isNumeric().withMessage("Vehicle capacity must be a number"),
];

// Routes
router.get("/", getAllVehicles);
router.post("/", vehicleValidation, addVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
