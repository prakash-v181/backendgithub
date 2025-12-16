const Commit = require("../models/commitModel");
const Repository = require("../models/repoModel");

/**
 * ============================
 * CREATE COMMIT (OWNER ONLY)
 * POST /api/repos/:repoId/commits
 * ============================
 */
exports.createCommit = async (req, res) => {
  try {
    const { message } = req.body;
    const { repoId } = req.params;

    // 1️⃣ Validate commit message
    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Commit message is required",
      });
    }

    // 2️⃣ Find repository
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({
        message: "Repository not found",
      });
    }

    // 3️⃣ Owner authorization check
    if (repo.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only repository owner can create commits",
      });
    }

    // 4️⃣ Create commit
    const commit = await Commit.create({
      message: message.trim(),
      repo: repoId,
      author: req.user.id,
    });

    // 5️⃣ Respond
    res.status(201).json(commit);
  } catch (error) {
    console.error("❌ CREATE COMMIT ERROR:", error);
    res.status(500).json({
      message: "Server error while creating commit",
    });
  }
};

/**
 * ============================
 * GET COMMITS FOR A REPO
 * GET /api/repos/:repoId/commits
 * ============================
 */
exports.getCommitsByRepo = async (req, res) => {
  try {
    const { repoId } = req.params;

    const commits = await Commit.find({ repo: repoId })
      .populate("author", "username")
      .sort({ createdAt: -1 }); // newest first (GitHub style)

    res.status(200).json(commits);
  } catch (error) {
    console.error("❌ GET COMMITS ERROR:", error);
    res.status(500).json({
      message: "Server error while fetching commits",
    });
  }
};
