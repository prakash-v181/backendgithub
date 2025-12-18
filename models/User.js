const mongoose = require("mongoose");
const { Schema } = mongoose;

// User schema
const UserSchema = new Schema(
  {
    // Username (unique)
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Email (unique)
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Password (hashed)
    password: {
      type: String,
      required: true,
    },

    // Repositories owned by this user
    repositories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Repository",
      },
    ],

    // Users this user follows
    followedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Repositories this user has starred
    starRepos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Repository",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Export model
module.exports = mongoose.model("User", UserSchema);



// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// // User schema
// const UserSchema = new Schema(
//   {
//     // Username (unique)
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },

//     // Email (unique)
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },

//     // Password (hashed)
//     password: {
//       type: String,
//       required: true,
//     },

//     // Repositories owned by this user
//     repositories: {
//       type: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "Repository",
//         },
//       ],
//       default: [],
//     },

//     // Users this user follows
//     followedUsers: {
//       type: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "User",
//         },
//       ],
//       default: [],
//     },

//     // Repositories this user has starred
//     starRepos: {
//       type: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "Repository",
//         },
//       ],
//       default: [],
//     },
//   },

//   // ✅ Correct place for timestamps
//   {
//     timestamps: true,
//   }
// );

// // Create model
// const User = mongoose.model("User", UserSchema);

// module.exports = User;
