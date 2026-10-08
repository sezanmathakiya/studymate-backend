import Subject from "../model/subject.schema.js";


// ===============================
// CREATE SUBJECT
// ===============================

export const createSubject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Subject name is required",
      });
    }

    const subject = await Subject.create({
      name,
      description,
      user: req.user.id,
    });

    res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.error("Create subject error:", error);

    next(error);
  }
};


// ===============================
// GET ALL SUBJECTS
// ===============================

export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Subjects fetched successfully",
      subjects,
    });
  } catch (error) {
    console.error("Get subjects error:", error);

    next(error);
  }
};


// ===============================
// UPDATE SUBJECT
// ===============================

export const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Subject name is required",
      });
    }

    const subject = await Subject.findOneAndUpdate(
      {
        _id: id,
        user: req.user.id,
      },
      {
        name,
        description,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject updated successfully",
      subject,
    });
  } catch (error) {
    console.error("Update subject error:", error);

    next(error);
  }
};


// ===============================
// DELETE SUBJECT
// ===============================

export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully",
      subject,
    });
  } catch (error) {
    console.error("Delete subject error:", error);

    next(error);
  }
};