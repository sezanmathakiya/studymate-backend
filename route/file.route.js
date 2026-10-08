
import express from "express";

import {
  uploadFile,
  getFiles,
  deleteFile,
} from "../controller/file.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Upload File
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadFile
);

// Get My Files
router.get(
  "/",
  authMiddleware,
  getFiles
);

// Delete File
router.delete(
  "/:id",
  authMiddleware,
  deleteFile
);

export default router;