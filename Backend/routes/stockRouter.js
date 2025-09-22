const express = require("express");
const router = express.Router();
const stock = require("../models/stock.js");

// Create a new category with image
router.post("/addItem", async (req, res) => {
  try {
    const { itemName,category,quantity,unit,threshold,supplierId,expiryDate } = req.body;
    if (!itemName ||!category ||!quantity ||!unit ||!threshold ||!supplierId ||!supplierId || !expiryDate ) {
      return res.status(400).json({ message: "item is required" });
    }

    const newItem = new stock({
      itemName,category,quantity,unit,threshold,supplierId,expiryDate,
      
    });

    await newItem.save();
    res.status(201).json({ message: "item added successfully", stock: newItem });
  } catch (err) {
    res.status(500).json({ message: "Error adding item", error: err.message });
  }
});


// Get all items (place this FIRST)
router.get("/items", async (req, res) => {
  try {
    const items = await stock.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items", error: err.message });
  }
});

// Get category by ID (must come after /items)
router.get("/:Itemid", async (req, res) => {
  try {
    const item = await stock.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ message: "Error fetching category", error: err.message });
  }
});

module.exports = router;