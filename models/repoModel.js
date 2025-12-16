const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stars: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repo", repoSchema);



// const mongoose = require("mongoose");

// const repositorySchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       default: "",
//     },
//     owner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     visibility: {
//       type: String,
//       enum: ["public", "private"],
//       default: "public",
//     },
//     content: [
//       {
//         type: String,
//       },
//     ],
//     issues: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Issue",
//       },
//     ],
//     stars: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Repository", repositorySchema);
