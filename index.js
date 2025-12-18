/* ================= ENV (MUST BE FIRST) ================= */
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

console.log(
  "ENV CHECK ON START (JWT_SECRET_KEY):",
  !!process.env.JWT_SECRET_KEY
);

/* ================= IMPORTS ================= */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const mainRouter = require("./routes/main.router");

/* ================= PORT ================= */
const PORT = process.env.PORT || 3002;

/* ================= MongoDB ================= */
async function connectMongo() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

/* ================= START SERVER ================= */
async function startServer() {
  if (!process.env.JWT_SECRET_KEY) {
    console.error("❌ JWT_SECRET_KEY missing in environment");
    process.exit(1);
  }

  await connectMongo();

  const app = express();

  /* ================= CORS (FINAL & CORRECT) ================= */
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server, Postman, Render health checks
        if (!origin) return callback(null, true);

        // Allow local development
        if (
          origin.startsWith("http://localhost:5173") ||
          origin.startsWith("http://localhost:3000")
        ) {
          return callback(null, true);
        }

        // ✅ Allow ALL Vercel deployments (preview + production)
        if (origin.endsWith(".vercel.app")) {
          return callback(null, true);
        }

        return callback(new Error("CORS not allowed"));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // ✅ REQUIRED for browser preflight requests
  app.options("*", cors());

  /* ================= MIDDLEWARE ================= */
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  /* ================= STATIC FILES ================= */
  app.use("/uploads", express.static("uploads"));

  /* ================= ROUTES ================= */
  app.use("/api", mainRouter);

  /* ================= ROOT ================= */
  app.get("/", (req, res) => {
    res.json({
      status: "Backend running successfully 🚀",
      time: new Date().toISOString(),
    });
  });

  /* ================= HEALTH ================= */
  app.get("/health", (_, res) => {
    res.json({ ok: true });
  });

  /* ================= ERROR HANDLER ================= */
  app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err.message);

    if (err.message === "CORS not allowed") {
      return res.status(403).json({ message: "CORS blocked" });
    }

    res.status(500).json({
      message: err.message || "Server error",
    });
  });

  /* ================= 404 ================= */
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  /* ================= HTTP + SOCKET.IO ================= */
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin.endsWith(".vercel.app")) {
          return callback(null, true);
        }
        callback(new Error("Socket CORS blocked"));
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);
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
