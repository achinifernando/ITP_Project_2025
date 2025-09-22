const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Client = require("../models/clientModel");
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // store in /uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage });

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "1d",
  });
};

// Register Client
const clientRegister = async (req, res) => {
  try {
    const { name, email, password, phone, companyName } = req.body;

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: "You already have an account" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newClient = await Client.create({
      name,
      email,
      password: hashedPassword,
      phone,
      companyName,
    });

    const token = generateToken(newClient._id);

    res
      .status(201)
      .json({ message: "Registered successfully", token, client: newClient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Login
const clientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = await Client.findOne({ email });
    if (!client)
      return res.status(400).json({ message: "Please signup first" });

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(client._id);

    res.json({ token, client });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Profile
const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // req.user is already a plain object without password
  res.status(200).json(req.user);
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await Client.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.companyName = req.body.companyName || user.companyName;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    if (req.file) {
      user.profileImageUrl = req.file.filename; // ✅ corrected
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      companyName: updatedUser.companyName,
      profileImageUrl: updatedUser.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientID);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json(client);
  } catch (err) {
    res.status(500).json({ message: "Error fetching client", error: err.message });
  }
};

module.exports = {
  upload,
  clientRegister,
  clientLogin,
  getUserProfile,
  updateUserProfile,
  getClientById,
};
