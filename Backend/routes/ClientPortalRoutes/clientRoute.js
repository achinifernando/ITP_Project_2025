const express = require("express");
const { upload,clientRegister,clientLogin,getUserProfile,updateUserProfile,getClientById} = require("../controllers/clientAuthController");
const { protectClient } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", clientRegister);
router.post("/login", clientLogin);

// Anyone logged in
router.get("/profile", protectClient, getUserProfile);



// Update profile with image
router.put("/updateProfile", protectClient, upload.single("profileImage"), updateUserProfile);

router.get("/:clientID", getClientById);



module.exports = router;
