const Client = require("../../models/ClientPortalModels/clientModel");
// Shared login logic for company and client
const sharedLogin = async (email, password, type) => {
  let user, role;
  if (type === "client") {
    user = await Client.findOne({ email });
    role = "client";
  } else {
    user = await User.findOne({ email });
    role = user ? user.role : "company";
  }
  if (!user) return null;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;
  const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return { token, user, role };
};

// Client login endpoint handler
const clientLogin = async (req, res) => {
  const { email, password } = req.body;
  const result = await sharedLogin(email, password, "client");
  if (!result) return res.status(401).json({ message: "Invalid credentials" });
  res.json(result);
};
// BackEnd/controllers/authController.js
const User = require("../../models/AttendenceTaskModel/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Employee ID generator function
const generateEmployeeId = async () => {
  try {
    const lastEmployee = await User.findOne({
      employeeId: { $exists: true, $ne: null },
    }).sort({ employeeId: -1 });

    let nextSequence = 1;

    if (lastEmployee && lastEmployee.employeeId) {
      const lastId = parseInt(lastEmployee.employeeId);
      if (!isNaN(lastId)) {
        nextSequence = lastId + 1;
      }
    }

    return nextSequence.toString().padStart(3, "0");
  } catch (error) {
    console.error("Error generating employee ID:", error);
    return Date.now().toString().slice(-3);
  }
};

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      profileImageUrl,
      role,
      adminInviteToken,
      contactNumber,
      address,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Generate sequential employee ID
    const employeeId = await generateEmployeeId();

    // Determine user role
    let userRole = "member";
    if (
      adminInviteToken &&
      adminInviteToken === process.env.ADMIN_INVITE_TOKEN
    ) {
      userRole = "admin";
    }

    // Only allow admin to create other admins or hr_managers
    if (req.user && req.user.role === "admin") {
      userRole = role || "member";
    }
  
    

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      employeeId,
      name,
      email,
      contactNumber,
      address,
      password: hashedPassword,
      profileImageUrl: profileImageUrl || null,
      role: userRole,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate employeeId error
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.employeeId
    ) {
      return res.status(400).json({
        message: "Employee ID generation conflict. Please try again.",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// If you need update profile function, add it here:
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.contactNumber = req.body.contactNumber || user.contactNumber;
      user.address = req.body.address || user.address;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        employeeId: updatedUser.employeeId,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImageUrl: updatedUser.profileImageUrl,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  clientLogin,
};
