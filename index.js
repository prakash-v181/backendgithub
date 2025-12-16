/* ================= ENV (MUST BE FIRST) ================= */
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

console.log(
  "ENV CHECK ON START (JWT_SECRET_KEY):",
  process.env.JWT_SECRET_KEY
);

/* ================= IMPORTS ================= */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const mainRouter = require("./routes/main.router");

const PORT = process.env.PORT || 3002;

/* ================= ALLOWED ORIGINS (CORS) ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://frontendgithubpr.vercel.app",
];

/* ================= MongoDB ================= */
async function connectMongo() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.error("❌ MONGO_URI missing in .env");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

/* ================= START SERVER ================= */
async function startServer() {
  // 🔐 JWT check
  if (!process.env.JWT_SECRET_KEY) {
    console.error("❌ JWT_SECRET_KEY missing in environment");
    process.exit(1);
  }

  await connectMongo();

  const app = express();

  /* -------- Middleware -------- */
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  /* -------- CORS (FIXED FOR VERCEL + LOCAL) -------- */
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Postman / server calls
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("CORS not allowed"));
      },
      credentials: true,
    })
  );

  /* -------- Static uploads -------- */
  app.use("/uploads", express.static("uploads"));

  /* -------- Routes -------- */
  app.use("/api", mainRouter);

  /* -------- Root route -------- */
  app.get("/", (req, res) => {
    res.json({
      status: "Backend running successfully 🚀",
      time: new Date().toISOString(),
    });
  });

  /* -------- Health check -------- */
  app.get("/health", (_, res) => {
    res.json({ ok: true });
  });

  /* -------- GLOBAL ERROR HANDLER -------- */
  app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err.message);

    if (err.message === "CORS not allowed") {
      return res.status(403).json({ message: "CORS blocked" });
    }

    if (err.message === "File type not allowed") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({
      message: err.message || "Server error",
    });
  });

  /* -------- 404 -------- */
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  /* -------- HTTP + Socket.IO -------- */
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

/* ================= BOOT ================= */
startServer().catch((err) => {
  console.error("❌ Startup error:", err);
  process.exit(1);
});
