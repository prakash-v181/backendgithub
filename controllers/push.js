// controllers/push.js
// Push commits:
//  1) Copy commits to .apnaGit/remote (local "remote")
//  2) Upload commits to AWS S3 using AWS SDK v3

const fs = require("fs/promises");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// --- AWS S3 client ---
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// Bucket name from .env
const BUCKET = process.env.S3_BUCKET;

// Debug log (ok now because BUCKET is defined)
console.log("Using S3 bucket:", BUCKET, "region:", process.env.AWS_REGION);

async function pushRepo() {
  try {
    const repoRoot = process.cwd();
    const commitsDir = path.join(repoRoot, ".apnaGit", "commits");
    const remoteDir = path.join(repoRoot, ".apnaGit", "remote");

    // 0) Check env needed for S3
    if (
      !process.env.AWS_REGION ||
      !process.env.AWS_ACCESS_KEY ||
      !process.env.AWS_SECRET_KEY ||
      !BUCKET
    ) {
      console.warn(
        "⚠️ AWS env vars missing (AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET)."
      );
      console.warn("   S3 upload will be skipped; only local remote will be used.");
    }

    // 1) Ensure commits exist
    let stat;
    try {
      stat = await fs.stat(commitsDir);
      if (!stat.isDirectory()) {
        console.error("❌ No commits directory found in .apnaGit/commits.");
        return;
      }
    } catch {
      console.error('❌ No commits found. Run: node index.js commit "message"');
      return;
    }

    // 2) Ensure local remote folder exists
    await fs.mkdir(remoteDir, { recursive: true });

    // 3) Copy commits → local remote
    await copyDir(commitsDir, remoteDir);
    console.log("✅ Pushed commits to local remote (.apnaGit/remote).");

    // 4) Upload commits → S3 (if env is configured)
    if (
      process.env.AWS_REGION &&
      process.env.AWS_ACCESS_KEY &&
      process.env.AWS_SECRET_KEY &&
      BUCKET
    ) {
      await uploadDirToS3(commitsDir);
      console.log(`✅ Pushed commits to AWS S3 bucket "${BUCKET}".`);
    } else {
      console.log(
        "⚠️ Skipped S3 upload because AWS env vars are not fully set."
      );
    }
  } catch (err) {
    console.error("❌ Error in push:", err);
  }
}

// Helper: recursively copy directory src → dest
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const fromPath = path.join(src, entry.name);
    const toPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(fromPath, toPath);
    } else if (entry.isFile()) {
      await fs.copyFile(fromPath, toPath);
    }
  }
}

// Helper: upload entire commits directory to S3
async function uploadDirToS3(commitsDir) {
  const entries = await fs.readdir(commitsDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(commitsDir, entry.name);

    if (entry.isDirectory()) {
      // entry.name is the commitId folder
      await uploadCommitFolderToS3(entryPath, entry.name);
    }
  }
}

// Upload one commit folder: commits/<commitId>/...
async function uploadCommitFolderToS3(commitPath, commitId) {
  const entries = await fs.readdir(commitPath, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = path.join(commitPath, entry.name);

    if (entry.isDirectory()) {
      // If you ever nest folders inside a commit, recurse:
      await uploadCommitFolderToS3(
        filePath,
        path.join(commitId, entry.name)
      );
    } else if (entry.isFile()) {
      const body = await fs.readFile(filePath);

      const key = `commits/${commitId}/${entry.name}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: body,
        })
      );

      console.log(`📤 Uploaded to S3: ${key}`);
    }
  }
}

module.exports = { pushRepo };





// const fs = require("fs").promises;
// const path = require("path");
// const { s3, S3_BUCKET } = require("../config/aws-config");

// async function pushRepo() {
//   const repoPath = path.resolve(process.cwd(), ".apnaGit");
//   const commitsPath = path.join(repoPath, "commits");

//   try {
//     const commitDirs = await fs.readdir(commitsPath);
//     for (const commitDir of commitDirs) {
//       const commitPath = path.join(commitsPath, commitDir);
//       const files = await fs.readdir(commitPath);

//       for (const file of files) {
//         const filePath = path.join(commitPath, file);
//         const fileContent = await fs.readFile(filePath);
//         const params = {
//           Bucket: S3_BUCKET,
//           Key: `commits/${commitDir}/${file}`,
//           Body: fileContent,
//         };

//         await s3.upload(params).promise();
//       }
//     }

//     console.log("All commits pushed to S3.");
//   } catch (err) {
//     console.error("Error pushing to S3 : ", err);
//   }
// }

// module.exports = { pushRepo };
