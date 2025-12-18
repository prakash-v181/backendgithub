const router = require("express").Router();
const authController = require("../controllers/auth");
const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Get current logged-in user
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
