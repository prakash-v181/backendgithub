const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Commit = require("../models/commitModel"); // ✅ FIXED
const authMiddleware = require("../middleware/authMiddleware");

router.get("/commits/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📥 Commit ID received:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid commit ID" });
    }

    const commit = await Commit.findById(id).populate("author", "username");

    if (!commit) {
      return res.status(404).json({ message: "Commit not found" });
    }

    res.status(200).json(commit);
  } catch (error) {
    console.error("❌ Commit fetch error:", error);
    res.status(500).json({ message: "Server error while fetching commit" });
  }
});

module.exports = router;
