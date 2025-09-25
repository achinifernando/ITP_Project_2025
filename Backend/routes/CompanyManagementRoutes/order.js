const express = require("express");
const router = express.Router();
const Order = require("../../models/ClientPortalModels/ordersModel.js");
const paymentSuccessTemplate = require("../../emails/paymentSuccess.js");
const paymentRejectedTemplate = require("../../emails/paymentRejected.js");
const sendEmail = require("../../utils/mailer.js");

// GET all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("lorryCategory")
      .populate("lorryType")
      .populate("userId", "name email");
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// UPDATE payment status
router.put("/:id/payment-status", async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!paymentStatus) return res.status(400).json({ error: "paymentStatus is required" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.paymentStatus = paymentStatus;

    // Update order status based on payment
    if (paymentStatus === "Rejected") {
      order.status = "Cancelled";
    } else if (paymentStatus === "Paid" && order.status === "Pending") {
      order.status = "Ongoing";
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("lorryCategory")
      .populate("lorryType")
      .populate("userId", "name email");

    res.status(200).json(populatedOrder);
  } catch (err) {
    console.error("Error updating payment status:", err);
    res.status(500).json({ error: "Error updating payment status" });
  }
});

// UPDATE order status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.paymentStatus !== "Paid") {
      return res.status(400).json({ error: "Cannot update order status until payment is Paid" });
    }

    order.status = status;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("lorryCategory")
      .populate("lorryType")
      .populate("userId", "name email");

    res.status(200).json(populatedOrder);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Error updating order status" });
  }
});

// MARK ongoing order as completed
router.put("/:id/complete", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.status !== "Ongoing") {
      return res.status(400).json({ error: "Only ongoing orders can be marked as completed" });
    }

    order.status = "Completed";
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("lorryCategory")
      .populate("lorryType")
      .populate("userId", "name email");

    res.status(200).json(populatedOrder);
  } catch (err) {
    console.error("Error marking order as completed:", err);
    res.status(500).json({ error: "Error marking order as completed" });
  }
});

// SEND email notification
router.post("/:id/send-email", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    let subject, html;
    if (order.paymentStatus === "Paid") {
      subject = "Payment Successful 🎉";
      html = paymentSuccessTemplate(order.userName);
    } else if (order.paymentStatus === "Rejected") {
      subject = "Payment Failed ❌";
      html = paymentRejectedTemplate(order.userName);
    } else {
      return res.status(400).json({ error: "No email template for this status" });
    }

    await sendEmail(order.email, subject, html);
    res.json({ message: `Email sent to ${order.email}` });
  } catch (err) {
    console.error("Failed to send email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
