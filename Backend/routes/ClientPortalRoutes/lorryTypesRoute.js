const router = require("express").Router();
const LorryType = require("../models/lorryTypesModel.js");
const upload = require('../middleware/imageUploadMiddleware');



// Create new lorry type (categoryId passed)
router.post("/add", upload.array("image", 10), async (req, res) => {
  try {
    const {
      category, // category ID from frontend
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
router.get("/category/:categoryId", async (req, res) => {
  try {
    const types = await LorryType.find({ category: req.params.categoryId });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single type by ID
router.get("/:lorryId", async (req, res) => {
  try {
    const type = await LorryType.findById(req.params.lorryId);
    if (!type) return res.status(404).json({ message: "Type not found" });
    res.json(type);
  } catch (err) {
    res.status(500).json({ message: "Error fetching type", error: err.message });
  }
});

// Update type (replace all data and images if uploaded)
// router.put("/update/:typeId", upload.array("images", 10), async (req, res) => {
//   try {
//     const type = await LorryType.findById(req.params.typeId);
//     if (!type) return res.status(404).json({ message: "Type not found" });

//     // If new images uploaded, replace them; otherwise keep old ones
//     let updatedImages = type.images;
//     if (req.files?.length) {
//       updatedImages = req.files.map(file => file.filename);
//     }

    // Update the whole object
//     const updatedType = await LorryType.findByIdAndUpdate(
//       req.params.typeId,
//       {
//         typeName: req.body.typeName,
//         frontEnd: req.body.frontEnd,
//         subFrame: req.body.subFrame,
//         rearFrame: req.body.rearFrame,
//         door: req.body.door,
//         roof: req.body.roof,
//         bumper: req.body.bumper,
//         floor: req.body.floor,
//         wallConstuction: req.body.wallConstuction,
//         images: updatedImages
//       },
//       { new: true }
//     );

//     res.json({ message: "Type updated successfully", type: updatedType });

//   } catch (err) {
//     res.status(500).json({ message: "Error updating type", error: err.message });
//   }
// });


// // Delete type and its images
// router.delete("/delete/:typeId", async (req, res) => {
//   try {
//     const type = await LorryType.findById(req.params.typeId);
//     if (!type) return res.status(404).json({ message: "Type not found" });

//     // Delete images from the uploads folder
//     if (type.images && type.images.length > 0) {
//       type.images.forEach(filename => {
//         const filePath = path.join(__dirname, "../uploads", filename); // adjust uploads path
//         fs.unlink(filePath, err => {
//           if (err) {
//             console.error(`Failed to delete image ${filename}:`, err.message);
//           }
//         });
//       });
//     }

//     // Delete the MongoDB document
//     await LorryType.findByIdAndDelete(req.params.typeId);

//     res.json({ message: "Type and images deleted successfully" });

//   } catch (err) {
//     res.status(500).json({ message: "Error deleting type", error: err.message });
//   }
// });
  
module.exports = router;
