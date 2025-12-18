const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User"); // ✅ FIXED (case-sensitive)

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Safety check
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ AUTH MIDDLEWARE ERROR:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
