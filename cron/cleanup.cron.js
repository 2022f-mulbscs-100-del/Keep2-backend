// import notes from "../Modals/notes.js";
import cron from "node-cron";

export const startCleanUpCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    // const now = new Date();
    // const reminderNotes =  await notes.findAll({
    //     where: {isDeleted:false, reminder: {le: now}}
    // });

    // for (const note of reminderNotes) {
    //     note.reminder = null;
    //     await note.save();
    // }

    console.log(`Cleanup cron job executed at ${new Date().toISOString()}`);
  });
};
