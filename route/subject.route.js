import express from "express";

import {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} from "../controller/subject.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { body } from "express-validator";

import { validateRequest } from "../middleware/validation.middleware.js";

const router = express.Router();


// ===============================
// CREATE SUBJECT
// ===============================

router.post(
  "/create",

  authMiddleware,

  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Subject name is required"),

    body("description")
      .optional()
      .trim(),
  ],

  validateRequest,

  createSubject
);


// ===============================
// GET SUBJECTS
// ===============================

router.get(
  "/",
  authMiddleware,
  getSubjects
);


// ===============================
// UPDATE SUBJECT
// ===============================

router.put(
  "/:id",

  authMiddleware,

  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Subject name cannot be empty"),

    body("description")
      .optional()
      .trim(),
  ],

  validateRequest,

  updateSubject
);


// ===============================
// DELETE SUBJECT
// ===============================

router.delete(
  "/:id",
  authMiddleware,
  deleteSubject
);


export default router;