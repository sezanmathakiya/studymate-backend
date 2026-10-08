import Task from "../model/task.schema.js";
import transporter from "../config/mail.js";


// ======================================================
// Send Task Reminders
// ======================================================

export const sendTaskReminders = async () => {
  try {
    const now = new Date();


    // ==================================================
    // Find Due / Overdue Tasks
    // Only tasks whose reminder has not been sent
    // ==================================================

    const tasks = await Task.find({
      status: {
        $ne: "completed",
      },

      dueDate: {
        $lte: now,
      },

      reminderSent: false,
    }).populate("user", "email");


    // ==================================================
    // No Tasks
    // ==================================================

    if (tasks.length === 0) {
      console.log("No tasks require reminders");
      return;
    }


    // ==================================================
    // Send Reminder
    // ==================================================

    for (const task of tasks) {

      if (!task.user || !task.user.email) {
        continue;
      }


      await transporter.sendMail({
        from: process.env.MAIL_USER,

        to: task.user.email,

        subject: `Task Reminder: ${task.title}`,

        text: `
Hello,

This is a reminder for your task.

Task: ${task.title}

Description: ${task.description || "No description"}

Priority: ${task.priority}

Due Date: ${task.dueDate}

Please complete your task.

Student Study Management
        `,
      });


      // ==================================================
      // Mark Reminder as Sent
      // ==================================================

      task.reminderSent = true;

      task.reminderSentAt = new Date();

      await task.save();


      console.log(
        `Reminder sent for task: ${task.title}`
      );
    }

  } catch (error) {

    console.error(
      "Reminder service error:",
      error.message
    );

  }
};