import mongoose from "mongoose";

import Subject from "../model/subject.schema.js";
import Task from "../model/task.schema.js";


// ======================================================
// Get Dashboard
// ======================================================

export const getDashboard = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);


    // ==================================================
    // Total Subjects
    // ==================================================

    const totalSubjects = await Subject.countDocuments({
      user: userId,
    });


    // ==================================================
    // Overall Task Progress
    // ==================================================

    const taskProgress = await Task.aggregate([
      {
        $match: {
          user: userId,
        },
      },

      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },
        },
      },
    ]);


    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;


    taskProgress.forEach((item) => {
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
        : Math.round(
            (completedTasks / totalTasks) * 100
          );


    // ==================================================
    // Subject-Wise Progress
    // ==================================================

    const subjectWiseProgress = await Task.aggregate([
      {
        $match: {
          user: userId,
        },
      },

      {
        $group: {
          _id: "$subject",

          totalTasks: {
            $sum: 1,
          },

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


    // ==================================================
    // Last 7 Days Activity
    // ==================================================

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setHours(0, 0, 0, 0);

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 6
    );


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

          completedTasks: {
            $sum: 1,
          },
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


    // ==================================================
    // Create All 7 Days
    // ==================================================

    const last7Days = [];


    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);

      date.setDate(
        date.getDate() - i
      );


      const year = date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        date.getDate()
      ).padStart(2, "0");


      const dateString =
        `${year}-${month}-${day}`;


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


    // ==================================================
    // Current Streak
    // ==================================================

    let currentStreak = 0;


    for (
      let i = last7Days.length - 1;
      i >= 0;
      i--
    ) {
      if (
        last7Days[i].completedTasks > 0
      ) {
        currentStreak++;
      } else {
        break;
      }
    }


    // ==================================================
    // Final Dashboard Response
    // ==================================================

    res.status(200).json({
      message: "Dashboard fetched successfully",

      totalSubjects,

      totalTasks,

      completedTasks,

      pendingTasks,

      inProgressTasks,

      completionPercentage,

      subjectWiseProgress,

      last7Days,

      currentStreak,
    });

  } catch (error) {
    console.error("Dashboard error:", error);

    next(error);
  }
};