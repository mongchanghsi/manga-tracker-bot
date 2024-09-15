import { Telegraf } from "telegraf";
import { Update } from "telegraf/types";
import userDb from "../../database/User";
import listDb from "../../database/List";
import { BookmarkSessionContext } from "../Bookmark/session";
import { CronJob } from "cron";
import { checkIfUrlExist } from "../../utils/checker";

const SCHEDUELD_TIME_2 = "00 00 00 * * *"; // Every day at 12am;
const SCHEDUELD_TIME = "00 00 */6 * * *"; // Every 6 hours;

const ScheduleUpdateBookmarks = async (
  bot: Telegraf<BookmarkSessionContext<Update>>
) => {
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
