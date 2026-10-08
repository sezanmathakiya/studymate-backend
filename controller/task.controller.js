
import mongoose from "mongoose";
import Task from "../model/task.schema.js";
import Subject from "../model/subject.schema.js";
import File from "../model/file.schema.js";

// ======================================================
// Create Task
// ======================================================

export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      subject,
      material,
    } = req.body;

    if (!title?.trim() || !subject) {
      return res.status(400).json({
        message: "Task title and subject are required",
      });
    }

    const subjectExists = await Subject.findOne({
      _id: subject,
      user: req.user.id,
    });

    if (!subjectExists) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    let materialId = null;

    if (material) {
      const fileExists = await File.findOne({
        _id: material,
        user: req.user.id,
      });

      if (!fileExists) {
        return res.status(404).json({
          message: "Uploaded material not found",
        });
      }

      materialId = fileExists._id;
    }

    const taskStatus = status || "pending";

    const task = await Task.create({
      title: title.trim(),
      description,
      status: taskStatus,
      priority: priority || "medium",
      dueDate: dueDate || undefined,
      completedAt:
        taskStatus === "completed" ? new Date() : null,
      subject,
      material: materialId,
      user: req.user.id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("subject", "name")
      .populate(
        "material",
        "originalName url mimeType size publicId resourceType"
      );

    return res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    next(error);
  }
};

// ======================================================
// Get All Tasks + Search + Filter
// ======================================================

export const getTasks = async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      subject,
      dueDate,
    } = req.query;

    const filter = {
      user: req.user.id,
    };

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (subject) {
      filter.subject = subject;
    }

    if (dueDate) {
      const start = new Date(dueDate);
      const end = new Date(dueDate);

      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({
          message: "Invalid due date",
        });
      }

      start.setHours(0, 0, 0, 0);
      end.setTime(start.getTime());
      end.setDate(end.getDate() + 1);

      filter.dueDate = {
        $gte: start,
        $lt: end,
      };
    }

    const tasks = await Task.find(filter)
      .populate("subject", "name")
      .populate(
        "material",
        "originalName url mimeType size publicId resourceType"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Tasks fetched successfully",
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    next(error);
  }
};

// ======================================================
// Get Overall Task Progress
// ======================================================

export const getTaskProgress = async (req, res, next) => {
  try {
    const userId = String(req.user.id);

    const result = await Task.aggregate([
      {
        $match: {
          $expr: {
            $eq: [
              { $toString: "$user" },
              userId,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;

    result.forEach((item) => {
      totalTasks += item.count;

      if (item._id === "completed") {
        completedTasks = item.count;
      }

      if (item._id === "pending") {
        pendingTasks = item.count;
      }

      if (item._id === "in-progress") {
        inProgressTasks = item.count;
      }
    });

    const completionPercentage =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    return res.status(200).json({
      message: "Task progress fetched successfully",
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionPercentage,
    });
  } catch (error) {
    console.error("Get task progress error:", error);
    next(error);
  }
};

// ======================================================
// Get Subject-Wise Task Progress
// ======================================================

export const getSubjectWiseProgress = async (
  req,
  res,
  next
) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const result = await Task.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: "$subject",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [
                { $eq: ["$status", "completed"] },
                1,
                0,
              ],
            },
          },
          pendingTasks: {
            $sum: {
              $cond: [
                { $eq: ["$status", "pending"] },
                1,
                0,
              ],
            },
          },
          inProgressTasks: {
            $sum: {
              $cond: [
                { $eq: ["$status", "in-progress"] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $unwind: "$subject",
      },
      {
        $project: {
          _id: 0,
          subjectId: "$subject._id",
          subjectName: "$subject.name",
          totalTasks: 1,
          completedTasks: 1,
          pendingTasks: 1,
          inProgressTasks: 1,
          completionPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      "$completedTasks",
                      "$totalTasks",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $sort: {
          subjectName: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Subject-wise progress fetched successfully",
      subjects: result,
    });
  } catch (error) {
    console.error("Get subject-wise progress error:", error);
    next(error);
  }
};

// ======================================================
// Get Last 7 Days Activity + Current Streak
// ======================================================

export const getTaskActivity = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const now = new Date();
    const today = new Date(
      now.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
    );

    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const activity = await Task.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
          completedAt: {
            $gte: sevenDaysAgo,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$completedAt",
              timezone: "Asia/Kolkata",
            },
          },
          completedTasks: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          completedTasks: 1,
        },
      },
    ]);

    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const foundDay = activity.find(
        (item) => item.date === dateString
      );

      last7Days.push({
        date: dateString,
        completedTasks: foundDay
          ? foundDay.completedTasks
          : 0,
      });
    }

    let currentStreak = 0;

    for (let i = last7Days.length - 1; i >= 0; i--) {
      if (last7Days[i].completedTasks > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return res.status(200).json({
      message: "Last 7 days activity fetched successfully",
      currentStreak,
      last7Days,
    });
  } catch (error) {
    console.error("Get task activity error:", error);
    next(error);
  }
};

// ======================================================
// Update Task
// ======================================================

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      subject,
      material,
    } = req.body;

    if (!title?.trim() || !subject) {
      return res.status(400).json({
        message: "Task title and subject are required",
      });
    }

    const subjectExists = await Subject.findOne({
      _id: subject,
      user: req.user.id,
    });

    if (!subjectExists) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    const existingTask = await Task.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    let materialId = existingTask.material;

    if (material !== undefined) {
      if (material === null || material === "") {
        materialId = null;
      } else {
        const fileExists = await File.findOne({
          _id: material,
          user: req.user.id,
        });

        if (!fileExists) {
          return res.status(404).json({
            message: "Uploaded material not found",
          });
        }

        materialId = fileExists._id;
      }
    }

    let completedAt = existingTask.completedAt;

    if (status === "completed") {
      if (!existingTask.completedAt) {
        completedAt = new Date();
      }
    } else {
      completedAt = null;
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        user: req.user.id,
      },
      {
        title: title.trim(),
        description,
        status: status || "pending",
        priority: priority || "medium",
        dueDate: dueDate || null,
        subject,
        material: materialId,
        completedAt,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    )
      .populate("subject", "name")
      .populate(
        "material",
        "originalName url mimeType size publicId resourceType"
      );

    return res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    next(error);
  }
};

// ======================================================
// Delete Task
// ======================================================

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      message: "Task deleted successfully",
      task,
    });
  } catch (error) {
    console.error("Delete task error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    next(error);
  }
};