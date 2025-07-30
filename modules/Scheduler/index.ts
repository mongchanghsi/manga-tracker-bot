import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 100;

import { Telegraf } from "telegraf";
import { Update } from "telegraf/types";
import userDb from "../../database/User";
import listDb from "../../database/List";
import { BookmarkSessionContext } from "../Bookmark/session";
import { CronJob } from "cron";
import { checkIfUrlExistV2, isValidUrl } from "../../utils/checker";
import { Bookmark } from "../../utils/types";

// const SCHEDULED_TIME = "00 00 */6 * * *"; // Every 6 hours;
const SCHEDULED_TIME = "00 00 * * * *"; // Every 24 hours

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

export const CheckLatestChapter = async (
  bot: Telegraf<BookmarkSessionContext<Update>>,
  telegramId: string,
  bookmarks: Bookmark[]
) => {
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
      const validation = await checkIfUrlExistV2(url, chapterToLookFor);
      if (validation === 500) {
        console.log("🔴 There is an issue with this URL ", `- ${url}`);
        bot.telegram.sendMessage(
          telegramId,
          `⚠️ ${_bookmark.name} - ${url} - There's is an issue with this URL which is preventing the bot from looking up the latest chapter. Advise to try another source!`
        );
      } else {
        console.log(validation.length === 0 ? "🟢" : "🔴", `- ${url}`);

        if (validation.length === 0) {
          const successUpdate = await listDb.updateBookmark(
            _bookmark.id,
            chapterToLookFor
          );
          if (successUpdate) {
            bot.telegram.sendMessage(
              telegramId,
              `${_bookmark.name} has just released a new chapter! ${url}`,
              {
                link_preview_options: {
                  is_disabled: true,
                },
              }
            );
          }
        } else {
          console.log(validation.join(" | "));
        }
      }
    } catch (error) {
      console.error(`Error processing bookmark ${_bookmark.id}:`, error);
    }
  }
};

const ScheduleUpdateBookmarks = async (
  bot: Telegraf<BookmarkSessionContext<Update>>
) => {
  console.log(
    `Scheduler Start Checks for All Registered Links @ ${getCurrentTime()}`
  );

  try {
    const users = await userDb.getAllUser();

    for (const _user of users) {
      const bookmarks = await listDb.getAllBookmarks(_user.telegramId);
      await CheckLatestChapter(bot, _user.telegramId, bookmarks);
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
