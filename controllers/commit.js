const mongoose = require("mongoose");
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
    const { repoId } = req.params;
    const { message } = req.body;

    // 1️⃣ Validate repoId
    if (!mongoose.Types.ObjectId.isValid(repoId)) {
      return res.status(400).json({ message: "Invalid repository ID" });
    }

    // 2️⃣ Validate message
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Commit message is required" });
    }

    // 3️⃣ Find repository
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // 4️⃣ Owner check
    if (repo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only repository owner can create commits",
      });
    }

    // 5️⃣ Create commit (commitID auto-generated)
    const commit = await Commit.create({
      message: message.trim(),
      repository: repoId,
      author: req.user._id,
    });

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

    if (!mongoose.Types.ObjectId.isValid(repoId)) {
      return res.status(400).json({ message: "Invalid repository ID" });
    }

    const commits = await Commit.find({ repository: repoId })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(commits);
  } catch (error) {
    console.error("❌ GET COMMITS ERROR:", error);
    res.status(500).json({
      message: "Server error while fetching commits",
    });
  }
};





// const fs = require("fs").promises;
// const path = require("path");
// const { v4: uuidv4 } = require("uuid");

// async function commitRepo(message) {
//   const repoPath = path.resolve(process.cwd(), ".apnaGit");
//   const stagedPath = path.join(repoPath, "staging");
//   const commitPath = path.join(repoPath, "commits");

//   try {
//     const commitID = uuidv4();
//     const commitDir = path.join(commitPath, commitID);
//     await fs.mkdir(commitDir, { recursive: true });

//     const files = await fs.readdir(stagedPath);
//     for (const file of files) {
//       await fs.copyFile(
//         path.join(stagedPath, file),
//         path.join(commitDir, file)
//       );
//     }

//     await fs.writeFile(
//       path.join(commitDir, "commit.json"),
//       JSON.stringify({ message, date: new Date().toISOString() })
//     );

//     console.log(`Commit ${commitID} created with message: ${message}`);
//   } catch (err) {
//     console.error("Error committing files : ", err);
//   }
// }

// module.exports = { commitRepo };
