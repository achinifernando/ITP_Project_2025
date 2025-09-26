// controllers/UserController.js
const User = require("../../models/AttendenceTaskModel/User");
const Task = require("../../models/AttendenceTaskModel/Task");
const bcrypt = require("bcryptjs");

// Get all users (Admin or HR Manager only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    const usersWithTasks = await Promise.all(
      users.map(async (user) => {
        // Get task counts
        const pendingTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Pending",
        });
        const inProgressTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "In Progress",
        });
        const completedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Completed",
        });

        // Get actual task details
        const tasks = await Task.find({ assignedTo: user._id })
          .select("title status dueDate")
          .sort({ createdAt: -1 })
          .limit(20); // Limit to prevent excessive data

        return {
          ...user._doc,
          pendingTasks,
          inProgressTasks,
          completedTasks,
          totalTasks: pendingTasks + inProgressTasks + completedTasks,
          tasks // Include actual task details
        };
      })
    );

    res.json(usersWithTasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user by ID (user can access their own data, admins/HR can access any)
const getUsersById = async (req, res) => {
  try {
    // Check if user is accessing their own data or is admin/hr_manager
    if (req.user._id.toString() !== req.params.id && 
        req.user.role !== "admin" && 
        req.user.role !== "hr_manager" &&
      req.user.role !== "company_manager"&&
    req.user.role !== "inventory_manager"&&
  req.user.role !== "dispatch_manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new user (Admin or HR Manager only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, profileImageUrl } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "member",
      profileImageUrl,
    });

    const savedUser = await newUser.save();
    res.status(201).json({ ...savedUser._doc, password: undefined });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a user (user can update their own data, admins/HR can update any)
const updateUser = async (req, res) => {
  try {
    const { name, email, role, profileImageUrl, password } = req.body;

    // Check if user is updating their own data or is admin/hr_manager
    if (req.user._id.toString() !== req.params.id && 
        req.user.role !== "admin" && 
        req.user.role !== "hr_manager" &&
      req.user.role !== "company_manager"&&
    req.user.role !== "inventory_manager"&&
  req.user.role !== "dispatch_manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Regular users can't change their role
    if (req.user._id.toString() === req.params.id && role && role !== req.user.role) {
      return res.status(403).json({ message: "You cannot change your own role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    
    // Only admin/hr_manager can change role
    if (role && (req.user.role === "admin" || req.user.role === "hr_manager" || req.user.role === "inventory_manager"|| req.user.role === "company_manager"|| req.user.role === "dispatch_manager" )) {
      user.role = role;
    }
    
    user.profileImageUrl = profileImageUrl || user.profileImageUrl;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();
    res.status(200).json({ ...updatedUser._doc, password: undefined });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Unable to delete user" });

    res.status(200).json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUsers, getUsersById, deleteUser, createUser, updateUser };