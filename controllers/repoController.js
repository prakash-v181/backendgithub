const Repository = require("../models/repoModel");

exports.createRepo = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, description, visibility } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Repository name is required" });
    }

    const repo = await Repository.create({
      name: name.trim(),
      description: description?.trim() || "",
      visibility: visibility === "private" ? "private" : "public",
      owner: req.user.id,
    });

    res.status(201).json(repo);
  } catch (err) {
    console.error("❌ CREATE REPO ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllRepos = async (req, res) => {
  try {
    const repos = await Repository.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    res.json(repos);
  } catch (err) {
    console.error("❌ GET REPOS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRepoById = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id)
      .populate("owner", "username email");

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (
      repo.visibility === "private" &&
      repo.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(repo);
  } catch (err) {
    console.error("❌ GET REPO ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRepoById = async (req, res) => {
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
    res.json(repo);
  } catch (err) {
    console.error("❌ UPDATE REPO ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteRepoById = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (repo.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await repo.deleteOne();
    res.json({ message: "Repository deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE REPO ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
