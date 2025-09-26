const express = require("express");
const router = express.Router();
const RepairMaintenance = require("../../models/ClientPortalModels/serviceRequestsModel");
const { protectUser, companyManager } = require("../../middleware/authMiddleware");

// GET all repair & maintenance requests
router.get("/", protectUser, async (req, res) => {
  try {
    const repairs = await RepairMaintenance.find(); 
    res.status(200).json(repairs);
  } catch (err) {
    console.error("Error fetching repair requests:", err);
    res.status(500).json({ error: "Error fetching repair requests" });
  }
});

// UPDATE repair status
router.put("/:id/status", protectUser, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });

    const updatedRepair = await RepairMaintenance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedRepair) return res.status(404).json({ error: "Repair request not found" });

    res.status(200).json(updatedRepair);
  } catch (err) {
    console.error("Error updating repair status:", err);
    res.status(500).json({ error: "Error updating repair status" });
  }
});

module.exports = router;
