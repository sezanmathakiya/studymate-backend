
import cloudinary from "../config/cloudinary.js";
import File from "../model/file.schema.js";
import Task from "../model/task.schema.js";

// ===============================
// UPLOAD FILE
// ===============================

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    // PDF માટે raw અને અન્ય ફાઇલો માટે auto
    const resourceType =
      req.file.mimetype === "application/pdf" ? "raw" : "auto";

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "student-study-app",
          resource_type: resourceType,
        },
        (error, uploadedResult) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadedResult);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const file = await File.create({
      originalName: req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      mimeType: req.file.mimetype,
      size: req.file.size,
      user: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file,
    });
  } catch (error) {
    console.error("File upload error:", error);
    next(error);
  }
};

// ===============================
// GET USER FILES
// ===============================

export const getFiles = async (req, res, next) => {
  try {
    const files = await File.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Files fetched successfully",
      files,
    });
  } catch (error) {
    console.error("Get files error:", error);
    next(error);
  }
};

// ===============================
// DELETE FILE
// ===============================

export const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // પહેલાં ફાઇલ સાથે જોડાયેલા Tasksમાંથી
    // material reference દૂર કરો.
    await Task.updateMany(
      { material: file._id, user: req.user.id },
      { $set: { material: null } }
    );

    // Cloudinary માંથી ફાઇલ ડિલીટ કરો.
    const result = await cloudinary.uploader.destroy(
      file.publicId,
      {
        resource_type: file.resourceType || "raw",
        type: "upload",
        invalidate: true,
      }
    );

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(
        `Cloudinary deletion failed: ${result.result}`
      );
    }

    // MongoDB માંથી ફાઇલ ડિલીટ કરો.
    await File.deleteOne({ _id: file._id });

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("File delete error:", error);
    next(error);
  }
};