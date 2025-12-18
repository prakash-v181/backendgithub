const mongoose = require("mongoose");
const Issue = require("../models/issueModel");
const Repository = require("../models/repoModel");

/* ===================== CREATE ISSUE ===================== */

async function createIssue(req, res) {
  try {
    const { repoId } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Issue title is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(repoId)) {
      return res.status(400).json({ error: "Invalid Repository ID!" });
    }

    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    const issue = new Issue({
      title,
      description,
      repository: repoId,
    });

    const result = await issue.save();

    // Add issue to repository
    repo.issues.push(result._id);
    await repo.save();

    res.status(201).json({
      message: "Issue created successfully!",
      issue: result,
    });
  } catch (err) {
    console.error("Error creating issue:", err.message);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
}

/* ===================== GET ALL ISSUES FOR REPO ===================== */

async function getAllIssues(req, res) {
  try {
    const { repoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(repoId)) {
      return res.status(400).json({ error: "Invalid Repository ID!" });
    }

    const issues = await Issue.find({ repository: repoId })
      .populate("repository")
      .populate("creator");

    if (!issues || issues.length === 0) {
      return res.status(404).json({ error: "No issues found!" });
    }

    res.json({
      message: "Issues found!",
      issues,
    });
  } catch (err) {
    console.error("Error fetching issues:", err.message);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
}

/* ===================== GET ISSUE BY ID ===================== */

async function getIssueById(req, res) {
  try {
    const { issueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ error: "Invalid Issue ID!" });
    }

    const issue = await Issue.findById(issueId)
      .populate("repository")
      .populate("creator");

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json(issue);
  } catch (err) {
    console.error("Error fetching issue:", err.message);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
}

/* ===================== UPDATE ISSUE ===================== */

async function updateIssueById(req, res) {
  try {
    const { issueId } = req.params;
    const { title, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ error: "Invalid Issue ID!" });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    if (title) issue.title = title;
    if (description) issue.description = description;
    if (status) issue.status = status;

    const updatedIssue = await issue.save();

    res.json({
      message: "Issue updated successfully!",
      issue: updatedIssue,
    });
  } catch (err) {
    console.error("Error updating issue:", err.message);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
}

/* ===================== DELETE ISSUE ===================== */

async function deleteIssueById(req, res) {
  try {
    const { issueId, repoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ error: "Invalid Issue ID!" });
    }

    const issue = await Issue.findByIdAndDelete(issueId);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    // Remove issue from repository
    if (repoId && mongoose.Types.ObjectId.isValid(repoId)) {
      await Repository.findByIdAndUpdate(
        repoId,
        { $pull: { issues: issueId } }
      );
    }

    res.json({ message: "Issue deleted successfully!" });
  } catch (err) {
    console.error("Error deleting issue:", err.message);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
}

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueById,
  deleteIssueById,
};










// const mongoose = require("mongoose");
// const Repository = require("../models/repoModel");
// const User = require("../models/User");

// const Issue = require("../models/issueModel");

// async function createIssue(req, res) {
//   const { title, description } = req.body;
//   const { id } = req.params;

//   try {
//     const issue = new Issue({
//       title,
//       description,
//       repository: id,
//     });

//     await issue.save();

//     res.status(201).json(issue);
//   } catch (err) {
//     console.error("Error during issue creation : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// async function updateIssueById(req, res) {
//   const { id } = req.params;
//   const { title, description, status } = req.body;
//   try {
//     const issue = await Issue.findById(id);

//     if (!issue) {
//       return res.status(404).json({ error: "Issue not found!" });
//     }

//     issue.title = title;
//     issue.description = description;
//     issue.status = status;

//     await issue.save();

//     res.json(issue, { message: "Issue updated" });
//   } catch (err) {
//     console.error("Error during issue updation : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// async function deleteIssueById(req, res) {
//   const { id } = req.params;

//   try {
//     const issue = Issue.findByIdAndDelete(id);

//     if (!issue) {
//       return res.status(404).json({ error: "Issue not found!" });
//     }
//     res.json({ message: "Issue deleted" });
//   } catch (err) {
//     console.error("Error during issue deletion : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// async function getAllIssues(req, res) {
//   const { id } = req.params;

//   try {
//     const issues = Issue.find({ repository: id });

//     if (!issues) {
//       return res.status(404).json({ error: "Issues not found!" });
//     }
//     res.status(200).json(issues);
//   } catch (err) {
//     console.error("Error during issue fetching : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// async function getIssueById(req, res) {
//   const { id } = req.params;
//   try {
//     const issue = await Issue.findById(id);

//     if (!issue) {
//       return res.status(404).json({ error: "Issue not found!" });
//     }

//     res.json(issue);
//   } catch (err) {
//     console.error("Error during issue updation : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// module.exports = {
//   createIssue,
//   updateIssueById,
//   deleteIssueById,
//   getAllIssues,
//   getIssueById,
// };
