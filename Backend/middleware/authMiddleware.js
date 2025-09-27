import jwt from "jsonwebtoken";
import Client from "../models/ClientPortalModels/clientModel.js";
import User from "../models/AttendenceTaskModel/User.js";

export const protectClient = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

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

export const protectUser = async (req, res, next) => {
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

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

export const hrManagerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "hr_manager")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. HR Manager or Admin only." });
  }
};

export const companyManager = (req, res, next) => {
  if (req.user && req.user.role === "company_manager") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Company Manager only." });
  }
};

export const inventoryManager = (req, res, next) => {
  if (req.user && req.user.role === "inventory_manager") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Inventory Manager only." });
  }
};

export const dispatchManager = (req, res, next) => {
  if (req.user && req.user.role === "dispatch_manager") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Dispatch Manager only." });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  };
};
