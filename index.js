
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import userRoutes from "./route/user.route.js";
import subjectRoutes from "./route/subject.route.js";
import taskRoutes from "./route/task.route.js";
import fileRoutes from "./route/file.route.js";
import dashboardRoutes from "./route/dashboard.route.js";

import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

import "./cron/reminder.cron.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

// ===============================
// SECURITY MIDDLEWARE
// ===============================

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

// ===============================
// RATE LIMITING
// ===============================

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

// Apply general rate limiter
app.use("/api/subjects", generalLimiter);
app.use("/api/tasks", generalLimiter);
app.use("/api/files", generalLimiter);
app.use("/api/dashboard", generalLimiter);

// Apply authentication rate limiter
app.use("/api/user", authLimiter);

// ===============================
// BODY PARSER
// ===============================

app.use(express.json({ limit: "1mb" }));

// ===============================
// DATABASE CONNECTION
// ===============================

const connectDB = async () => {
  if (!process.env.DB_URL) {
    throw new Error("DB_URL is missing in environment variables");
  }

  try {
    await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 15000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.reason?.servers) {
      for (const [address, server] of error.reason.servers) {
        console.error(`\nServer: ${address}`);
        console.error("Status:", server.type);
        console.error(
          "Server error:",
          server.error?.message || "No detailed error"
        );
      }
    }

    if (error.cause) {
      console.error("\nUnderlying cause:", error.cause);
    }

    throw error;
  }
};

// ===============================
// API ROUTES
// ===============================

app.use("/api/user", userRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Student Study Management API is running",
    status: "success",
  });
});

// ===============================
// 404 NOT FOUND HANDLER
// ===============================

app.use(notFoundMiddleware);

// ===============================
// CENTRAL ERROR HANDLER
// ===============================

app.use(errorMiddleware);

// ===============================
// START SERVER
// ===============================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.error("Backend startup failed.");
    process.exit(1);
  }
};

startServer();