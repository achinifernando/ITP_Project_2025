// backend/routes/tracking.js

const express = require("express");
const router = express.Router();

// ✅ FIX 1: Add the missing functions to the import list
const {
  addTrackingUpdate,
  getTrackingByDelivery,
  getLatestTrackingByDelivery,
  startTrackingDelivery,      // Add this
  stopTrackingDelivery,       // Add this
} = require("../../controllers/DispatchControllers/trackingController");
const { protectUser, dispatchManager } = require("../../middleware/authMiddleware");

// ✅ FIX 2: Use the functions directly, without "trackingController."
router.post("/start", startTrackingDelivery);
router.post("/stop/:deliveryId", stopTrackingDelivery);

// These routes were already correct
router.post("/",protectUser, addTrackingUpdate);
router.get("/:deliveryId",protectUser, getTrackingByDelivery);
router.get("/:deliveryId/latest",protectUser, getLatestTrackingByDelivery);

module.exports = router;