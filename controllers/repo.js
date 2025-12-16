const Repository = require("../models/repoModel");

/**
 * ============================
 * CREATE REPOSITORY
 * POST /api/repos/create
 * ============================
 */
const createRepo = async (req, res) => {
  try {
    // auth check (safety)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, description, visibility } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Repository name is required",
      });
    }

    const repo = await Repository.create({
      name: name.trim(),
      description: description?.trim() || "",
      visibility: visibility === "private" ? "private" : "public",
      owner: req.user.id,
    });

    res.status(201).json(repo);
  } catch (error) {
    console.error("❌ CREATE REPO ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ============================
 * GET ALL REPOSITORIES (CURRENT USER)
 * GET /api/repos/all
 * ============================
 */
const getAllRepos = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const repos = await Repository.find({
      owner: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(repos);
  } catch (error) {
    console.error("❌ GET REPOS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ============================
 * GET REPOSITORY BY ID
 * GET /api/repos/:id
 * ============================
 */
const getRepoById = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id).populate(
      "owner",
      "username email"
    );

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // private repo protection
    if (
      repo.visibility === "private" &&
      repo.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(repo);
  } catch (error) {
    console.error("❌ GET REPO ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ============================
 * UPDATE REPOSITORY (OWNER ONLY)
 * PUT /api/repos/:id
 * ============================
 */
const updateRepoById = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (repo.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, description, visibility } = req.body;

    if (name !== undefined) repo.name = name.trim();
    if (description !== undefined) repo.description = description;
    if (visibility !== undefined) {
      repo.visibility = visibility === "private" ? "private" : "public";
    }

    await repo.save();
    res.status(200).json(repo);
  } catch (error) {
    console.error("❌ UPDATE REPO ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ============================
 * DELETE REPOSITORY (OWNER ONLY)
 * DELETE /api/repos/:id
 * ============================
 */
const deleteRepoById = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (repo.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await repo.deleteOne();
    res.status(200).json({ message: "Repository deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE REPO ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createRepo,
  getAllRepos,
  getRepoById,
  updateRepoById,
  deleteRepoById,
};
