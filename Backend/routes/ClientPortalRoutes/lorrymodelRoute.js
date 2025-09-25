const express = require("express");
const router = express.Router();
const lorryModels = require("../models/lorryModelModel.js");


// Create a new model 
router.post("/add", async (req, res) => {
  try {
    const { model } = req.body;
    if (!model ) {
      return res.status(400).json({ message: "Model are required" });
    }

    const newModel = new lorryModels({
      model,
    });

    await newModel.save();
    res.status(201).json({ message: "Model added successfully", model: newModel });
  } catch (err) {
    res.status(500).json({ message: "Error adding model", error: err.message });
  }
});

// Get all categories
router.get("/models", async (req, res) => {
  try {
    const models = await lorryModels.find();
    res.status(200).json(models);
  } catch (err) {
    res.status(500).json({ message: "Error fetching models", error: err.message });
  }
});

// Get single category by ID
router.get("/:typeId", async (req, res) => {
  try {
    const model = await lorryModels.findById(req.params.typeId);
    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }
    res.status(200).json(model);
  } catch (err) {
    res.status(500).json({ message: "Error fetching model", error: err.message });
  }
});


// Update category (with optional image update)
router.put("/update/:typeId", async (req, res) => {
  try {
    const { model } = req.body;
    const updateData = { model};

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedModel = await lorryModels.findByIdAndUpdate(
      req.params.typeId,
      updateData,
      { new: true }
    );

    if (!updatedModel) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Model updated successfully", model: updatedModel });
  } catch (err) {
    res.status(500).json({ message: "Error updating model", error: err.message });
  }
});

// Delete category
router.delete("/delete/:typeId", async (req, res) => {
  try {
    const deletedModel = await lorryModels.findByIdAndDelete(req.params.typeId);
    if (!deletedModel) {
      return res.status(404).json({ message: "Model not found" });
    }
    res.status(200).json({ message: "Model deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting model", error: err.message });
  }
});

module.exports = router;
