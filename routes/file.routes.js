const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  uploadFile,
  getFilesByRepo,
} = require("../controllers/file.controller");

/* GET FILES */
router.get(
  "/repos/:repoId/files",
  authMiddleware,
  getFilesByRepo
);

/* UPLOAD FILE */
router.post(
  "/repos/:repoId/files",
  authMiddleware,
  upload.single("file"), // 🔴 MUST be "file"
  uploadFile
);

module.exports = router;
