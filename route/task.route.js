import express from "express";

import {
  createTask,
  getTasks,
  getTaskProgress,
  getSubjectWiseProgress,
  getTaskActivity,
  updateTask,
  deleteTask,
} from "../controller/task.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { body } from "express-validator";

import { validateRequest } from "../middleware/validation.middleware.js";

const router = express.Router();


// ===============================
// CREATE TASK
// ===============================

router.post(
  "/create",

  authMiddleware,

  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Task title is required"),

    body("subject")
      .trim()
      .notEmpty()
      .withMessage("Subject is required"),

    body("status")
      .optional()
      .isIn(["pending", "in-progress", "completed"])
      .withMessage(
        "Status must be pending, in-progress, or completed"
      ),

    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage(
        "Priority must be low, medium, or high"
      ),

    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid date"),
  ],

  validateRequest,

  createTask
);


// ===============================
// GET ALL TASKS
// ===============================

router.get(
  "/",
  authMiddleware,
  getTasks
);


// ===============================
// OVERALL TASK PROGRESS
// ===============================

router.get(
  "/progress",
  authMiddleware,
  getTaskProgress
);


// ===============================
// SUBJECT-WISE TASK PROGRESS
// ===============================

router.get(
  "/progress/subjects",
  authMiddleware,
  getSubjectWiseProgress
);


// ===============================
// LAST 7 DAYS ACTIVITY
// ===============================

router.get(
  "/activity",
  authMiddleware,
  getTaskActivity
);


// ===============================
// UPDATE TASK
// ===============================

router.put(
  "/:id",

  authMiddleware,

  [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Task title cannot be empty"),

    body("subject")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Subject cannot be empty"),

    body("status")
      .optional()
      .isIn(["pending", "in-progress", "completed"])
      .withMessage(
        "Status must be pending, in-progress, or completed"
      ),

    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage(
        "Priority must be low, medium, or high"
      ),

    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid date"),
  ],

  validateRequest,

  updateTask
);


// ===============================
// DELETE TASK
// ===============================

router.delete(
  "/:id",
  authMiddleware,
  deleteTask
);


export default router;