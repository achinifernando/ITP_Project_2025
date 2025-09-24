// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Client = require("../models/clientModel");
const User = require("../models/User");

const protectClient = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET  || "your_jwt_secret");

      const client = await Client.findById(decoded.id).select("-password");
      if (!client) return res.status(401).json({ message: "Client not found" });

      req.user = client;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

const hrManagerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "hr_manager")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. HR Manager or Admin only." });
  }
};


module.exports = { protectClient ,protect, adminOnly, hrManagerOrAdmin};

