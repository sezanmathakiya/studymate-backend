import express from "express";

import {
  getDashboard,
} from "../controller/dashboard.controller.js";

import {
  authMiddleware,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Get Dashboard
router.get(
  "/",
  authMiddleware,
  getDashboard
);

export default router;