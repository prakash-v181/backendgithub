const express = require("express");
const userController = require("../controllers/userController");

const userRouter = express.Router();

/* ===================== Auth Routes ===================== */

// POST /api/auth/signup
userRouter.post("/signup", userController.signup);

// POST /api/auth/login
userRouter.post("/login", userController.login);

// GET /api/auth/me - Get current logged-in user (needs token in header)
userRouter.get("/me", userController.getCurrentUser);

/* ===================== User Profile Routes ===================== */

// GET /api/auth/allUsers
userRouter.get("/allUsers", userController.getAllUsers);

// GET /api/auth/profile/:id
userRouter.get("/profile/:id", userController.getUserProfile);

// PUT /api/auth/profile/:id
userRouter.put("/profile/:id", userController.updateUserProfile);

// DELETE /api/auth/profile/:id
userRouter.delete("/profile/:id", userController.deleteUserProfile);

module.exports = userRouter;












// const express = require("express");
// const userController = require("../controllers/userController");

// const userRouter = express.Router();

// userRouter.get("/allUsers", userController.getAllUsers);
// userRouter.post("/signup", userController.signup);
// userRouter.post("/login", userController.login);
// userRouter.get("/userProfile/:id", userController.getUserProfile);
// userRouter.put("/updateProfile/:id", userController.updateUserProfile);
// userRouter.delete("/deleteProfile/:id", userController.deleteUserProfile);

// module.exports = userRouter;
