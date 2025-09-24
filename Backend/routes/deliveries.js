const express = require("express");
const router = express.Router();
const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const Assignment = require("../models/Assignment");

// GET all deliveries
router.get("/", async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate("driver")
      .populate("vehicle");
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single delivery
router.get("/:id", async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate("driver")
      .populate("vehicle");
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE delivery
router.post("/", async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();
    res.status(201).json(delivery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE delivery
router.put("/:id", async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("driver").populate("vehicle");
    
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE delivery - ADD THIS ROUTE
router.delete("/:id", async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Free up driver and vehicle if they were assigned
    if (delivery.driver) {
      await Driver.findByIdAndUpdate(delivery.driver, { isAvailable: true });
    }
    if (delivery.vehicle) {
      await Vehicle.findByIdAndUpdate(delivery.vehicle, { isAvailable: true });
    }

    // Delete any assignment records
    await Assignment.deleteMany({ delivery: req.params.id });

    // Delete the delivery
    await Delivery.findByIdAndDelete(req.params.id);

    res.json({ message: "Delivery deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;