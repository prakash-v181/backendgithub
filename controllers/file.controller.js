const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const File = require("../models/fileModel");

/* ================= UPLOAD FILE ================= */
exports.uploadFile = async (req, res) => {
  try {
    console.log("📁 Upload request received");

    const { repoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(repoId)) {
      return res.status(400).json({ message: "Invalid repository ID" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("📄 File uploaded:", req.file.originalname);

    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (repo.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only owner can upload files" });
    }

    const file = await File.create({
      repo: repoId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file,
    });
  } catch (err) {
    console.error("UPLOAD FILE ERROR:", err);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
};

/* ================= GET FILES ================= */
exports.getFilesByRepo = async (req, res) => {
  try {
    const { repoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(repoId)) {
      return res.status(400).json({ message: "Invalid repository ID" });
    }

    const files = await File.find({ repo: repoId })
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (err) {
    console.error("GET FILES ERROR:", err);
    res.status(500).json({ message: "Failed to load files" });
  }
};
