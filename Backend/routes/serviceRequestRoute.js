const express = require("express");
const router = express.Router();
const serviceRequest = require("../models/serviceRequestsModel");
const { protectClient } = require("../middleware/authMiddleware");
const upload = require('../middleware/imageUploadMiddleware');



//  Create Service Request 
router.post("/submit",protectClient, upload.array("image", 10), async (req, res) => {
  try {
    const {userName,phoneNumber,email,companyName,address,city,lorryModel,lorryNumber,serviceType,issueDescription,preferredDate
    } = req.body;

    // Validate required fields
    if ( !userName || !phoneNumber || !email || !companyName ||
      !address || !city || !lorryModel || !lorryNumber ||
      !serviceType || !issueDescription || !preferredDate || !req.files?.length
    ) {
      return res.status(400).json({ message: "All fields including images are required" });
    }

    
    const imageFiles = req.files.map(file => file.filename);

    const newServiceRequest = new serviceRequest({
      userId: req.user._id,
      userName: req.user.name,
      phoneNumber: req.user.phone,
      email: req.user.email,
      companyName: req.user.companyName, 
      address,
      city,
      lorryModel,
      lorryNumber,
      serviceType,
      issueDescription,
      preferredDate,
      createdAt: new Date(),
      image: imageFiles,
    });

    await newServiceRequest.save();
    res.status(201).json({
      message: "Service request submitted successfully",
      request: newServiceRequest
    });
  } catch (err) {
    res.status(500).json({ message: "Error submitting service request", error: err.message });
  }
});

// ===== Get All Service Requests =====
router.get("/my_services",protectClient, async (req, res) => {
  try {
    const userId = req.user._id; // comes from protect middleware

    const requests = await serviceRequest.find({userId});
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching service requests", error: err.message });
  }
});

// ===== Get Single Service Request =====
router.get("/:id", async (req, res) => {
  try {
    const requestData = await serviceRequest.findById(req.params.id);
    if (!requestData) {
      return res.status(404).json({ message: "Service request not found" });
    }
    res.status(200).json(requestData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching request", error: err.message });
  }
});

// ===== Delete Service Request =====
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedRequest = await serviceRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ message: "Service request not found" });
    }
    res.status(200).json({ message: "Service request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting request", error: err.message });
  }
});

module.exports = router;
