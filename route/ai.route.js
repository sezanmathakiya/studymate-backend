
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { chatWithAI } from "../controller/ai.controller.js";

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many AI requests. Please try again later.",
  },
});

router.post("/", authMiddleware, aiLimiter, chatWithAI);

export default router;
