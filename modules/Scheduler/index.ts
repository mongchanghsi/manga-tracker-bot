import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 100;

import { Telegraf } from "telegraf";
import { Update } from "telegraf/types";
import userDb from "../../database/User";
import listDb from "../../database/List";
import { BookmarkSessionContext } from "../Bookmark/session";
import { CronJob } from "cron";
import { CheckMultiAndUpdateAndSend } from "../../utils/checkAndSend";

const SCHEDULED_TIME = "00 00 */8 * * *"; // Every 8 hours;
// const SCHEDULED_TIME = "00 00 */24 * * *"; // Every 24 hours

const getCurrentTime = (): string => {
  const _date = new Date();

  const day = String(_date.getDate()).padStart(2, "0");
  const month = String(_date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = _date.getFullYear();

  let hours = _date.getHours();
  const minutes = String(_date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12; // Convert to 12-hour format
  const _hours = hours ? String(hours).padStart(2, "0") : "12"; // '0' should be '12'

  return `${day}/${month}/${year} ${_hours}:${minutes}${ampm}`;
};

const ScheduleUpdateBookmarks = async (
  bot: Telegraf<BookmarkSessionContext<Update>>
) => {
  console.log(
    `Scheduler Start Checks for All Registered Links @ ${getCurrentTime()}`
  );

  try {
    const users = await userDb.getAllUser();

    const now = new Date();
    const hours = now.getUTCHours(); // assuming UTC-based cron job
    const intervalIndex = Math.floor(hours / 8);

    for (const _user of users) {
      const bookmarks = await listDb.getAllBookmarks(_user.telegramId);
      const filteredBookmarks = bookmarks.filter(
        (bookmark) => bookmark.id % 3 === intervalIndex
      );
      await CheckMultiAndUpdateAndSend(bot, _user, filteredBookmarks);

      await new Promise((res) => setTimeout(res, 500));
    }
  } catch (error) {
    console.error("Error scheduling updates:", error);
  } finally {
    console.log(
      `Scheduler Ends Checks for All Registered Links @ ${getCurrentTime()}`
    );
  }
};

export const initCronJob = (bot: Telegraf<BookmarkSessionContext<Update>>) => {
  new CronJob(
    SCHEDULED_TIME, // cronTime
    () => ScheduleUpdateBookmarks(bot),
    null,
    true,
    null,
    null,
    null,
    +480 // UTC+8, represented in minutes
  );
};
