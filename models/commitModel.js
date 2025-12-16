const mongoose = require("mongoose");
const crypto = require("crypto");

const CommitSchema = new mongoose.Schema(
  {
    commitID: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(20).toString("hex"),
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Commit", CommitSchema);



// models/commitModel.js
// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const CommitSchema = new Schema(
//   {
//     commitID: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     message: {
//       type: String,
//       required: true,
//     },
//     timestamp: {
//       type: Date,
//       default: Date.now,
//     },
//     files: [
//       {
//         type: String, // file names included in the commit
//       },
//     ],
//     // later you can add: user, repository, etc.
//   },
//   { timestamps: false }
// );

// const Commit = mongoose.model("Commit", CommitSchema);

// module.exports = Commit;
