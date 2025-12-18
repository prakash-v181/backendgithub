const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const repoRoutes = require("./repo.router");
const fileRoutes = require("./file.routes");

// Auth routes
router.use("/auth", authRoutes);

// Repository routes
router.use("/repos", repoRoutes);

// File upload & fetch routes
router.use("/", fileRoutes);

module.exports = router;




// const express = require("express");
// const userRouter = require("./user.router");
// const repoRouter = require("./repo.router");
// const issueRouter = require("./issue.router");
// const { getAllCommits } = require("../controllers/commit");


// const mainRouter = express.Router();

// mainRouter.use(userRouter);
// mainRouter.use(repoRouter);
// mainRouter.use(issueRouter);

// // router.get("/commits", getAllCommits);

// mainRouter.get("/", (req, res) => {
//   res.send("Welcome!");
// });

// module.exports = mainRouter;
