const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const lorryCategories = require("../models/lorryCategoriesModel.js");
const stock = require("../models/stock.js");

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

// Create a new category with image
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { category,description } = req.body;
    if (!category || !description ||!req.file) {
      return res.status(400).json({ message: "Name,description and image are required" });
    }

    const newCategory = new lorryCategories({
      category,description,
      image: req.file.filename
    });

    await newCategory.save();
    res.status(201).json({ message: "Category added successfully", category: newCategory });
  } catch (err) {
    res.status(500).json({ message: "Error adding category", error: err.message });
  }
});

// Get all categories
router.get("/products", async (req, res) => {
  try {
    const categories = await lorryCategories.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
});

// Get single category by ID
router.get("/:typeId", async (req, res) => {
  try {
    const category = await lorryCategories.findById(req.params.typeId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: "Error fetching category", error: err.message });
  }
});


// Update category (with optional image update)
router.put("/update/:typeId", upload.single("image"), async (req, res) => {
  try {
    const { category,description } = req.body;
    const updateData = { category,description};

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedCategory = await lorryCategories.findByIdAndUpdate(
      req.params.typeId,
      updateData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
  } catch (err) {
    res.status(500).json({ message: "Error updating category", error: err.message });
  }
});

// Delete category
router.delete("/delete/:typeId", async (req, res) => {
  try {
    const deletedCategory = await lorryCategories.findByIdAndDelete(req.params.typeId);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", error: err.message });
  }
});









module.exports = router;
