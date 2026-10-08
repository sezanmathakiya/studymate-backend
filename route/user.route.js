import express from "express";

import {
  signupuser,
  loginuser,
} from "../controller/user.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { body } from "express-validator";

import { validateRequest } from "../middleware/validation.middleware.js";

const router = express.Router();


// ===============================
// SIGNUP
// ===============================

router.post(
  "/signup",

  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],

  validateRequest,

  signupuser
);


// ===============================
// LOGIN
// ===============================

router.post(
  "/login",

  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email"),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],

  validateRequest,

  loginuser
);


// ===============================
// PROTECTED PROFILE
// ===============================

router.get(
  "/profile",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      message: "Protected route accessed",
      user: req.user,
    });
  }
);


export default router;