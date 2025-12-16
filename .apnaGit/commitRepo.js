const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function createCommitId() {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = crypto.randomBytes(4).toString("hex");
  return `${ts}-${rand}`;
}

function commitRepo(messageArg) {
  try {
    const message = (messageArg || "").trim();
    if (!message) {
      console.error('❌ Usage: node index.js commit "<message>"');
      return;
    }

    const repoRoot = process.cwd();
    const metaDir = path.join(repoRoot, ".apnaGit");
    const stagingDir = path.join(metaDir, "staging");
    const commitsDir = path.join(metaDir, "commits");
    const commitJsonPath = path.join(repoRoot, "commit.json");

    ensureDir(metaDir);
    ensureDir(stagingDir);
    ensureDir(commitsDir);

    let commitObj = { staged: [], commits: [] };
    if (fs.existsSync(commitJsonPath)) {
      commitObj = JSON.parse(fs.readFileSync(commitJsonPath, "utf8"));
    }

    if (!commitObj.staged.length) {
      console.error("❌ Nothing to commit");
      return;
    }

    const commitId = createCommitId();
    const commitFolder = path.join(commitsDir, commitId);
    ensureDir(commitFolder);

    const committedFiles = [];

    for (const file of commitObj.staged) {
      const dest = path.join(commitFolder, file.filename);
      fs.copyFileSync(file.stagedPath, dest);

      committedFiles.push({
        ...file,
        committedPath: dest,
      });
    }

    commitObj.commits.push({
      id: commitId,
      message,
      files: committedFiles,
      committedAt: new Date().toISOString(),
    });

    commitObj.staged = [];
    fs.writeFileSync(commitJsonPath, JSON.stringify(commitObj, null, 2));

    console.log(`✅ Commit created: ${commitId}`);
  } catch (err) {
    console.error("❌ commitRepo error:", err.message);
  }
}

module.exports = { commitRepo };
