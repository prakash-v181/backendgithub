const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET_KEY || "super-secret-key";

/* ===================== SIGNUP ===================== */

async function signup(req, res) {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.username === username
            ? "Username already taken"
            : "Email already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    });

    const result = await newUser.save();

    const token = jwt.sign({ id: result._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      userId: result._id,
      user: {
        id: result._id,
        username: result.username,
        email: result.email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({
      message: "Error during signup",
      error: err.message,
    });
  }
}

/* ===================== LOGIN ===================== */

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      userId: user._id,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({
      message: "Error during login",
      error: err.message,
    });
  }
}

/* ===================== GET CURRENT USER (ME) ===================== */

async function getCurrentUser(req, res) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get current user error:", err.message);

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    res.status(500).json({
      message: "Error fetching current user",
      error: err.message,
    });
  }
}

/* ===================== GET USER PROFILE BY ID ===================== */

async function getUserProfile(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err.message);
    res.status(500).json({
      message: "Error fetching profile",
      error: err.message,
    });
  }
}

/* ===================== GET ALL USERS ===================== */

async function getAllUsers(req, res) {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Fetch all users error:", err.message);
    res.status(500).json({
      message: "Error fetching users",
      error: err.message,
    });
  }
}

/* ===================== UPDATE USER PROFILE ===================== */

async function updateUserProfile(req, res) {
  try {
    const { id } = req.params;
    const { email, password, bio, avatar } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: updatedUser.toObject({ getters: true, versionKey: false }),
    });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({
      message: "Error updating profile",
      error: err.message,
    });
  }
}

/* ===================== DELETE USER PROFILE ===================== */

async function deleteUserProfile(req, res) {
  try {
    const { id } = req.params;

    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete profile error:", err.message);
    res.status(500).json({
      message: "Error deleting profile",
      error: err.message,
    });
  }
}

module.exports = {
  signup,
  login,
  getCurrentUser,
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  deleteUserProfile,
};
