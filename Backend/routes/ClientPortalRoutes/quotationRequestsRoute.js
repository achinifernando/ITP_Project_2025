const express = require("express");
const app = express();
const cors = require("cors");
const router = express.Router();
const mongoose = require("mongoose");
const QuotationRequest = require("../models/quotationRequestModel");
const { protectClient } = require("../middleware/authMiddleware");

app.use(cors());
app.use(express.json()); // <-- this is required


// Create Quotation Request
router.post("/submit", protectClient, async (req, res) => {
  try {
    const { lorryCategory, lorryType, lorryModel, quantity, customFeatures, expectedDeliveryDate } = req.body;

    // Validate required fields
    if (!lorryCategory || !lorryType || !lorryModel || !quantity || !customFeatures || !expectedDeliveryDate) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Validate ObjectIds
        if ( !mongoose.Types.ObjectId.isValid(lorryCategory) ||
            !mongoose.Types.ObjectId.isValid(lorryType) || !mongoose.Types.ObjectId.isValid(lorryModel)) {
          return res.status(400).json({ message: "Invalid IDs" });
        }

    // Validate quantity
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    // Validate expectedDeliveryDate
    const deliveryDate = new Date(expectedDeliveryDate);
    if (isNaN(deliveryDate.getTime())) {
      return res.status(400).json({ message: "Expected delivery date is invalid" });
    }

    // Create new quotation request
    const newQuotationRequest = new QuotationRequest({
      clientID: req.user._id,
      lorryCategory,
      lorryType,
      lorryModel,
      quantity: qty,
      customFeatures,
      expectedDeliveryDate: deliveryDate,
    });

    await newQuotationRequest.save();

    // Populate references
    const populatedQuotationRequest = await QuotationRequest.findById(newQuotationRequest._id)
      .populate("clientID","customFeatures")
      .populate("lorryCategory", "category")
      .populate("lorryType", "typeName")
      .populate("lorryModel", "model");
      

    res.status(201).json({
      message: "Quotation request submitted successfully",
      quotationRequest: populatedQuotationRequest
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error submitting quotation request",
      error: err.message
    });
  }
});


// Get all orders of the logged-in user
router.get("/my-quotationRequest", protectClient, async (req, res) => {
  try {
    const clientID = req.user._id; // comes from protect middleware

    const quotation = await QuotationRequest.find({ clientID }) 
      .populate("lorryCategory", "category")
      .populate("lorryType", "typeName");

    res.status(200).json(quotation);
  } catch (error) {
    console.error("Error fetching user quotation requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});


//get all requests
router.get("/allQuotationrequests", async (req, res) => {
  try {
    const Requests = await QuotationRequest.find();
    res.status(200).json(Requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests", error: err.message });
  }
});


// Get single request with client details
router.get("/:requestID", async (req, res) => {
  try {
    const request = await QuotationRequest.findById(req.params.requestID)
      .populate("clientID")       // <-- this fetches the client details
      .populate("lorryCategory")
      .populate("lorryType")
      .populate("lorryModel");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request); // request.clientID now has all client info
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


//get all requests
router.get("/allQuotationrequests", async (req, res) => {
  try {
    const Requests = await QuotationRequest.find();
    res.status(200).json(Requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests", error: err.message });
  }
});

module.exports = router;
