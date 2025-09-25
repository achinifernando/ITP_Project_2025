const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const service = require("../models/servicesModel");


// Multer storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create a new service with image
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { serviceType,description } = req.body;
    if (!serviceType || !description||!req.file) {
      return res.status(400).json({ message: "Service,description and image are required" });
    }

    const newService = new service({
      serviceType,description,
      image: req.file.filename
    });

    await newService.save();
    res.status(201).json({ message: "Service added successfully", service: newService });
  } catch (err) {
    res.status(500).json({ message: "Error adding service", error: err.message });
  }
});

// Get all services
router.get("/getServices", async (req, res) => {
  try {
    const services = await service.find();
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ message: "Error fetching services", error: err.message });
  }
});

// Get single service by ID
router.get("/:serviceId", async (req, res) => {
  try {
    const service = await service.findById(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ message: "Error fetching service", error: err.message });
  }
});

// Update service (with optional image update)
router.put("/update/:serviceId", upload.single("image"), async (req, res) => {
  try {
    const { serviceType,description } = req.body;
    const updateData = { serviceType,description};

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedService = await service.findByIdAndUpdate(
      req.params.serviceId,
      updateData,
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Services updated successfully", service: updatedService });
  } catch (err) {
    res.status(500).json({ message: "Error updating service", error: err.message });
  }
});

// Delete service
router.delete("/delete/:serviceId", async (req, res) => {
  try {
    const deletedService= await service.findByIdAndDelete(req.params.serviceId);
    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting service", error: err.message });
  }
});

module.exports = router;
