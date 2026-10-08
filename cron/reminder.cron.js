import cron from "node-cron";

import { sendTaskReminders } from "../service/reminder.service.js";


// ======================================================
// Task Reminder Cron
// ======================================================

// Runs every 5 minutes

cron.schedule("*/5 * * * *", async () => {
  console.log("Checking task reminders...");

  await sendTaskReminders();
});

console.log("Reminder cron started");