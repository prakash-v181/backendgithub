const express = require("express");
const router = express.Router();

// ✅ FIXED PATH
const authMiddleware = require('../middleware/authMiddleware');


const repoController = require("../controllers/repo");
const commitController = require("../controllers/commit");

// ============================
// REPOSITORIES
// ============================

// ✅ CREATE REPO
// POST /api/repos/create
router.post("/create", authMiddleware, repoController.createRepo);

// ✅ GET ALL REPOS
// GET /api/repos/all
router.get("/all", authMiddleware, repoController.getAllRepos);

// ✅ GET REPO BY ID
// GET /api/repos/:id
router.get("/:id", authMiddleware, repoController.getRepoById);

// ✅ UPDATE REPO
// PUT /api/repos/:id
router.put("/:id", authMiddleware, repoController.updateRepoById);

// ✅ DELETE REPO
// DELETE /api/repos/:id
router.delete("/:id", authMiddleware, repoController.deleteRepoById);

// ============================
// COMMITS
// ============================

// CREATE COMMIT
// POST /api/repos/:repoId/commits
router.post(
  "/:repoId/commits",
  authMiddleware,
  commitController.createCommit
);

// GET COMMITS
// GET /api/repos/:repoId/commits
router.get(
  "/:repoId/commits",
  authMiddleware,
  commitController.getCommitsByRepo
);

module.exports = router;
