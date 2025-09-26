const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const LorryType = require("../../models/ClientPortalModels/lorryTypesModel");
const { protectUser, companyManager } = require("../../middleware/authMiddleware");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create new lorry type
router.post("/add", protectUser, upload.array("image", 10), async (req, res) => {
  try {
    const {
      category,
      typeName, frontEnd, subFrame, rearFrame, bumper, door, roof, floor, wallConstuction
    } = req.body;

    if (!category || !typeName || !req.files?.length) {
      return res.status(400).json({ message: "Category, typeName and at least one image are required" });
    }

    const imageFiles = req.files.map(file => file.filename);

    const newType = new LorryType({
      category,
      typeName,
      frontEnd,
      subFrame,
      rearFrame,
      bumper,
      door,
      roof,
      floor,
      wallConstuction,
      images: imageFiles
    });

    await newType.save();
    res.status(201).json({ message: "Type added successfully", type: newType });

  } catch (err) {
    res.status(500).json({ message: "Error adding type", error: err.message });
  }
});

// Get all types for a category ID
router.get("/", protectUser, async (req, res) => {
  try {
    const types = await LorryType.find().populate("category"); // optional populate
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Get single type by ID
router.get("/:lorryId", protectUser, async (req, res) => {
  try {
    const type = await LorryType.findById(req.params.lorryId);
    if (!type) return res.status(404).json({ message: "Type not found" });
    res.json(type);
  } catch (err) {
    res.status(500).json({ message: "Error fetching type", error: err.message });
  }
});

// Update type
router.put("/update/:typeId", protectUser, upload.array("images", 10), async (req, res) => {
  try {
    const type = await LorryType.findById(req.params.typeId);
    if (!type) return res.status(404).json({ message: "Type not found" });

    let updatedImages = type.images;
    if (req.files?.length) {
      updatedImages = req.files.map(file => file.filename);
    }

    const updatedType = await LorryType.findByIdAndUpdate(
      req.params.typeId,
      {
        typeName: req.body.typeName,
        frontEnd: req.body.frontEnd,
        subFrame: req.body.subFrame,
        rearFrame: req.body.rearFrame,
        door: req.body.door,
        roof: req.body.roof,
        bumper: req.body.bumper,
        floor: req.body.floor,
        wallConstuction: req.body.wallConstuction,
        images: updatedImages
      },
      { new: true }
    );

    res.json({ message: "Type updated successfully", type: updatedType });

  } catch (err) {
    res.status(500).json({ message: "Error updating type", error: err.message });
  }
});

// Delete type and its images
router.delete("/delete/:typeId", protectUser, async (req, res) => {
  try {
    const type = await LorryType.findById(req.params.typeId);
    if (!type) return res.status(404).json({ message: "Type not found" });

    if (type.images && type.images.length > 0) {
      type.images.forEach(filename => {
        const filePath = path.join(__dirname, "../uploads", filename);
        fs.unlink(filePath, err => {
          if (err) {
            console.error(`Failed to delete image ${filename}:`, err.message);
          }
        });
      });
    }

    await LorryType.findByIdAndDelete(req.params.typeId);

    res.json({ message: "Type and images deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting type", error: err.message });
  }
});

module.exports = router;
