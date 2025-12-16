const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const { repoId } = req.params;

    if (!repoId) {
      return cb(new Error("Repository ID is missing"));
    }

    const uploadPath = path.join(
      __dirname,
      "..",
      "uploads",
      "repos",
      repoId
    );

    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(new Error("Failed to create upload directory"));
    }
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

/**
 * ✅ MIME + extension safe filter
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "text/plain",
    "text/markdown",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const allowedExtensions = [".txt", ".md", ".doc", ".docx"];

  const ext = path.extname(file.originalname).toLowerCase();

  if (
    !allowedMimeTypes.includes(file.mimetype) &&
    !allowedExtensions.includes(ext)
  ) {
    return cb(
      new Error("File type not allowed. Use .txt, .md, .doc, .docx")
    );
  }

  cb(null, true);
};

module.exports = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
});
