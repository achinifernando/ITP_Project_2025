const express = require("express");
const router = express.Router();
const { protectUser } = require("../../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  clientLogin,
} = require("../../controllers/AttendenceController/authController");
// Client login route
router.post("/client-login", clientLogin);
const upload = require("../../middleware/uploadMiddleware"); // use the centralized multer config

// Debug: Log imported function types
console.log("registerUser:", typeof registerUser);
console.log("loginUser:", typeof loginUser);
console.log("getUserProfile:", typeof getUserProfile);
console.log("updateUserProfile:", typeof updateUserProfile);

// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protectUser, getUserProfile);
router.put("/profile", protectUser, updateUserProfile);

// Upload Image Route
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.status(200).json({ imageUrl });
});

module.exports = router;
