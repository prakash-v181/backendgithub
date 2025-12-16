const router = require("express").Router();
const authController = require("../controllers/auth");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
