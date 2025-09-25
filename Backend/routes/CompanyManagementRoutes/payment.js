const express = require("express");
const router = express.Router();
const Payment = require("../../models/ClientPortalModels/paymentsModel");

// GET all payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("clientId", "name email phone") // client details
      .populate("requestId", "customFeatures quantity expectedDeliveryDate status") // quotation request fields
      .populate("quotationId", "totalPrice items remarks status validUntil acceptedAt") // quotation fields
      .sort({ uploadedAt: -1 });

    res.status(200).json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error:err.message});
  }
});

// UPDATE payment status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });

    // Allow only success or unsuccess
    const allowedStatus = ["pending", "success", "unsuccess"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    payment.status = status;
    if (status === "success") payment.verifiedAt = new Date(); // optional timestamp

    await payment.save();

    const populatedPayment = await Payment.findById(payment._id)
      .populate("clientId", "name email phone")
      .populate("requestId", "customFeatures quantity expectedDeliveryDate status")
      .populate("quotationId", "totalPrice items remarks status validUntil acceptedAt");

    res.status(200).json(populatedPayment);
  } catch (err) {
    console.error("Error updating payment status:", err);
    res.status(500).json({ error: "Error updating payment status" });
  }
});

module.exports = router;
