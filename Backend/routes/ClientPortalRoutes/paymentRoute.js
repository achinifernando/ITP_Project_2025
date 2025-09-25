const express = require("express");
const router = express.Router();
const upload = require("../../middleware/fileUploadMiddleware");
const { protectClient } = require("../../middleware/authMiddleware");

const Payment = require("../../models/ClientPortalModels/paymentsModel");
const Order = require("../../models/ClientPortalModels/ordersModel");
const ServiceRequest = require("../../models/ClientPortalModels/serviceRequestsModel");

// Upload payment receipt for an order
router.post("/:type/:id/payment", protectClient, upload.single("receipt"), async (req, res) => {
  try {
    const { type, id } = req.params; // type = "order" or "service"
    const userId = req.user._id;
    const { paymentMethod, amount } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Receipt file is required" });
    }


    let item;
    if (type === "order") {
      item = await Order.findOne({ _id: id, userId });
    } else if (type === "service") {
      item = await ServiceRequest.findOne({ _id: id, userId });
    } else {
      return res.status(400).json({ message: "Invalid payment type" });
    }

    if (!item) {
      return res.status(404).json({ message: `${type} not found` });
    }


    // Check if payment already exists
    const existingPayment = await Payment.findOne({ [`${type}Id`]: id });
    if (existingPayment) {
      return res.status(400).json({ message: `Payment already exists for this ${type}` });
    }

    // Create payment record
    const payment = new Payment({
      userId,
      amount: amount || item.totalPrice, // fallback if amount not passed
      receiptFile: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
      paymentMethod,
     ...(type === "order" ? { orderId: id } : { serviceId: id }),
      status: "pending",
    });

    await payment.save();

    // Update related item paymentStatus
    item.paymentStatus = "paid";
    await item.save();

    res.status(201).json({
      message: `Payment uploaded successfully for ${type}`,
      payment,
    });
  } catch (error) {
    console.error("Payment route error:", error);
    res.status(500).json({ message: error.message });
  }
});



// Get payment history for a client
router.get("/my_payments", protectClient, async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ userId })
      .populate("orderId")
      .populate({ path: "serviceId", strictPopulate: false })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
