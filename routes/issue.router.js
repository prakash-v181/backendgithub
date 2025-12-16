const express = require("express");
const issueController = require("../controllers/issueController");

const issueRouter = express.Router();

/* ===================== Issue Routes ===================== */

// POST /api/issues/:repoId - Create issue
issueRouter.post("/:repoId", issueController.createIssue);

// GET /api/issues/:repoId - Get all issues for a repo
issueRouter.get("/:repoId", issueController.getAllIssues);

// GET /api/issues/:repoId/:issueId - Get specific issue
issueRouter.get("/:repoId/:issueId", issueController.getIssueById);

// PUT /api/issues/:repoId/:issueId - Update issue
issueRouter.put("/:repoId/:issueId", issueController.updateIssueById);

// DELETE /api/issues/:repoId/:issueId - Delete issue
issueRouter.delete("/:repoId/:issueId", issueController.deleteIssueById);

module.exports = issueRouter;
