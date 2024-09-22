import { Telegraf } from "telegraf";
import { Update } from "telegraf/types";
import userDb from "../../database/User";
import listDb from "../../database/List";
import { BookmarkSessionContext } from "../Bookmark/session";
import { CronJob } from "cron";
import { checkIfUrlExist } from "../../utils/checker";

const SCHEDUELD_TIME_2 = "00 00 00 * * *"; // Every day at 12am;
const SCHEDUELD_TIME = "00 00 */6 * * *"; // Every 6 hours;

const getCurrentTime = (): string => {
  const _date = new Date();

  const day = String(_date.getDate()).padStart(2, "0");
  const month = String(_date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = _date.getFullYear();

  let hours: any = _date.getHours();
  const minutes = String(_date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12; // Convert to 12-hour format
  hours = hours ? String(hours).padStart(2, "0") : "12"; // '0' should be '12'

  return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
};

const ScheduleUpdateBookmarks = async (
  bot: Telegraf<BookmarkSessionContext<Update>>
) => {
  console.log(`Checking for new chapters @ ${getCurrentTime()}`);

  const users = await userDb.getAllUser();
  users.forEach(async (_user) => {
    const bookmarks = await listDb.getBookmarks(_user.telegramId);
    bookmarks.forEach(async (_bookmark) => {
      const chapterToLookFor = _bookmark.latestChapter + 1;
      const url = _bookmark.url.replace(
        _bookmark.latestChapter,
        chapterToLookFor
      );
      console.log(`Checking ${url}`);
      const hasNextChapter = await checkIfUrlExist(url, chapterToLookFor);
      console.log(hasNextChapter ? "🟢" : "🔴", `- ${url}`);

      if (hasNextChapter) {
        const successUpdate = await listDb.updateBookmark(
          _bookmark.id,
          chapterToLookFor
        );
        if (successUpdate) {
          bot.telegram.sendMessage(
            _user.telegramId,
            `${_bookmark.name} has just released a new chapter! ${url}`,
            {
              link_preview_options: {
                is_disabled: true,
              },
            }
          );
        }
      }
    });
  });
};

export const initCronJob = (bot: Telegraf<BookmarkSessionContext<Update>>) => {
  new CronJob(
    SCHEDUELD_TIME, // cronTime
    () => ScheduleUpdateBookmarks(bot),
    null,
    true,
    null,
    null,
    null,
    +480 // UTC+8, represented in minutes
  );
};
