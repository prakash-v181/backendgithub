// controllers/add.js
const fs = require("fs");
const path = require("path");

const MAX_READ_BYTES = 1024;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function addRepo(filePathArg) {
  try {
    if (!filePathArg) {
      console.error("Usage: node index.js add <file>");
      return;
    }

    const normalizedArg = filePathArg.trim();
    const candidate = path.isAbsolute(normalizedArg)
      ? path.normalize(normalizedArg)
      : path.resolve(process.cwd(), normalizedArg);

    console.log("Using S3 bucket:", process.env.S3_BUCKET || "undefined", "region:", process.env.AWS_REGION || "undefined");
    console.log("Attempting to add file ->", candidate);

    if (!fs.existsSync(candidate)) {
      console.error(" File not found:", candidate);
      return;
    }

    const stats = fs.statSync(candidate);
    if (!stats.isFile()) {
      console.error("Target is not a regular file:", candidate);
      return;
    }

    // quick read to ensure readable
    try {
      const fd = fs.openSync(candidate, "r");
      const buf = Buffer.alloc(Math.min(MAX_READ_BYTES, stats.size || MAX_READ_BYTES));
      const bytes = fs.readSync(fd, buf, 0, buf.length, 0);
      fs.closeSync(fd);
      console.log(`Read ${bytes} bytes from file (permission OK).`);
    } catch (err) {
      console.error("Unable to read file (permission/lock):", err.message);
      return;
    }

    // Ensure .apnaGit/staging exists in project root
    const repoRoot = process.cwd();
    const repoMetaDir = path.join(repoRoot, ".apnaGit");
    const stagingDir = path.join(repoMetaDir, "staging");

    ensureDir(stagingDir);

    // Determine staged filename. If a staged file with the same name exists, overwrite but keep a backup
    const base = path.basename(candidate);
    let stagedPath = path.join(stagingDir, base);

    if (fs.existsSync(stagedPath)) {
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const backupName = `${base}.backup.${ts}`;
      const backupPath = path.join(stagingDir, backupName);
      fs.renameSync(stagedPath, backupPath);
      console.log(`Existing staged file renamed to backup: ${backupName}`);
    }

    // Copy file to staging
    fs.copyFileSync(candidate, stagedPath);
    console.log("✅ File copied to staging:", stagedPath);

    // Update commit.json in repo root to record staged files
    const commitJsonPath = path.join(repoRoot, "commit.json");
    let commitObj = {};
    try {
      if (fs.existsSync(commitJsonPath)) {
        const raw = fs.readFileSync(commitJsonPath, "utf8");
        commitObj = raw ? JSON.parse(raw) : {};
      }
    } catch (err) {
      console.warn("Warning: could not parse existing commit.json - creating fresh. Error:", err.message);
      commitObj = {};
    }

    if (!Array.isArray(commitObj.staged)) commitObj.staged = [];

    // Add staged entry (avoid duplicates: remove any existing staged entry for same stagedPath)
    commitObj.staged = commitObj.staged.filter(e => e.stagedPath !== stagedPath);

    const stagedEntry = {
      filename: base,
      originalPath: candidate,
      stagedPath: stagedPath,
      size: stats.size,
      stagedAt: new Date().toISOString()
    };

    commitObj.staged.push(stagedEntry);

    fs.writeFileSync(commitJsonPath, JSON.stringify(commitObj, null, 2), "utf8");
    console.log("✅ commit.json updated (staged list).");

    console.log("\nSummary:");
    console.log(" - original:", candidate);
    console.log(" - staged:  ", stagedPath);
    console.log('To commit staged files, run: node index.js commit "your message"');
  } catch (err) {
    console.error("❌ Error in addRepo:", err.stack || err.message);
  }
}

module.exports = { addRepo };
