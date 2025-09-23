const express = require("express");
const app = express();
const cors = require("cors");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/ordersModel");
const { protectClient } = require("../middleware/authMiddleware");

app.use(cors());
app.use(express.json()); 


// ===== Create order =====
router.post("/submit",protectClient, async (req, res) => {
 
  try {
    const {userName,phoneNumber,email,companyName,address,city,lorryCategory,lorryType,quantity,additionalFeatures} = req.body; 

    // Validate ObjectIds
    if ( !mongoose.Types.ObjectId.isValid(lorryCategory) ||
        !mongoose.Types.ObjectId.isValid(lorryType)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    // Validate required fields
    if (!userName || !phoneNumber || !email || !companyName ||
        !address || !city || !lorryCategory || !lorryType || !quantity) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Validate quantity
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    // Create new order
    const newOrder = new Order({
     userId: req.user._id,
      userName: req.user.name,
      phoneNumber: req.user.phone,
      email: req.user.email,
      companyName: req.user.companyName, 
      address, 
      city, 
      lorryCategory, 
      lorryType, 
      quantity: qty, 
      additionalFeatures});

    await newOrder.save();

    const populatedOrder = await Order.findById(newOrder._id)
      .populate("userId", "userName email phoneNumber companyName")
      .populate("lorryCategory", "category")
      .populate("lorryType", "typeName");

    res.status(201).json({
      message: "Order request submitted successfully",
      order: populatedOrder
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error submitting order request",
      error: err.message
    });
  }
});

//  Get all orders of the logged-in user
router.get("/my-orders",protectClient, async (req, res) => {
  try {

   const userId = req.user._id; // comes from protect middleware

    const orders = await Order.find({ userId })
      .populate("lorryCategory")
      .populate("lorryType");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error" });
    }
  });


// ===== Get Single Order =====
router.get("/order/:id", async (req, res) => {
  try {
    const orderData = await Order.findById(req.params.id)
      .populate("lorryCategory")
      .populate("lorryType");

    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(orderData);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching order",
      error: err.message,
    });
  }
});

// ===== Delete Order =====
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting order",
      error: err.message,
    });
  }
});

module.exports = router;
