import { Telegraf } from "telegraf";
import { Update } from "telegraf/types";
import userDb from "../../database/User";
import listDb from "../../database/List";
import { BookmarkSessionContext } from "../Bookmark/session";
import { CronJob } from "cron";
import { checkIfUrlExist, isValidUrl } from "../../utils/checker";

const SCHEDUELD_TIME = "00 00 */6 * * *"; // Every 6 hours;

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
  console.log(`Checking for new chapters @ ${getCurrentTime()}`);

  try {
    const users = await userDb.getAllUser();

    for (const _user of users) {
      const bookmarks = await listDb.getAllBookmarks(_user.telegramId);
      for (const _bookmark of bookmarks) {
        try {
          if (
            _bookmark.latestChapter === null ||
            _bookmark.url === null ||
            _bookmark.url.length === 0 ||
            !isValidUrl(_bookmark.url)
          )
            continue; // Skips checking if latestChapter is null or not a valid url
          const chapterToLookFor = _bookmark.latestChapter + 1;
          const url = _bookmark.url.replace(
            _bookmark.latestChapter.toString(),
            chapterToLookFor.toString()
          );
          console.log(`Checking ${url}`);
          const hasNextChapter = await checkIfUrlExist(url, chapterToLookFor);
          if (hasNextChapter === 500) {
            console.log("🔴 There is an issue with this URL ", `- ${url}`);
            bot.telegram.sendMessage(
              _user.telegramId,
              `⚠️ ${_bookmark.name} - ${url} - There's is an issue with this URL which is preventing the bot from looking up the latest chapter. Advise to try another source!`
            );
          } else {
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
          }
        } catch (error) {
          console.error(`Error processing bookmark ${_bookmark.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error scheduling updates:", error);
  }
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
