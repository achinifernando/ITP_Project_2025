// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Client = require("../models/clientModel");

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


module.exports = { protectClient };

