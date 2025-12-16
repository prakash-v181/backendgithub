// backend/middleware/verifyToken.js

const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    // Get token from Authorization header: "Bearer TOKEN"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No token provided in Authorization header");
      return res.status(401).json({ error: "No token provided" });
    }

    // Extract token from "Bearer TOKEN"
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      console.log("❌ Token is empty");
      return res.status(401).json({ error: "Token is empty" });
    }

    console.log("🔍 Token:", token.substring(0, 20) + "...");

    // IMPORTANT: Use the SAME secret as in authController.js
    // This is the most common issue with JWT verification!
    const secret = process.env.JWT_SECRET || "your_secret_key_here";
    console.log("🔍 Using JWT_SECRET:", secret === "your_secret_key_here" ? "default" : "from .env");

    // Verify token
    const decoded = jwt.verify(token, secret);

    console.log("✅ Token verified");
    console.log("🔍 Decoded token:", {
      id: decoded.id,
      _id: decoded._id,
      userId: decoded.userId,
      username: decoded.username
    });

    // Set userId on request - try multiple possible field names
    req.userId = decoded.id || decoded._id || decoded.userId;
    req.user = decoded;

    console.log("✅ req.userId set to:", req.userId);

    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        error: "Invalid token",
        type: "JsonWebTokenError"
      });
    }
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Token expired",
        type: "TokenExpiredError"
      });
    }

    return res.status(401).json({ 
      error: "Token verification failed",
      message: err.message,
      type: err.name
    });
  }
}

module.exports = verifyToken;
