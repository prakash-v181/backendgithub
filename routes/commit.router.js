const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createCommit,
  getCommitsByRepo,
} = require("../controllers/commitController");

// ============================
// CREATE COMMIT (OWNER ONLY)
// POST /api/commits/:repoId
// ============================
router.post("/:repoId", authMiddleware, createCommit);

// ============================
// GET COMMITS FOR A REPO
// GET /api/commits/:repoId
// ============================
router.get("/:repoId", authMiddleware, getCommitsByRepo);

module.exports = router;
