import { Telegraf } from "telegraf";
import { Update } from "telegraf/types";
import userDb from "../../database/User";
import listDb from "../../database/List";
import { MyContext } from "../..";

const checkIfUrlExist = async (url: string) => {
  try {
    const response = await fetch(url);
    if (response.status === 404) return false;

    const data = await response.text();
    if (!data.includes(`Manga Info`)) return false;

    return true;
  } catch (error) {
    console.log("Checking Url Error", error);
  }
};

const ScheduleUpdateBookmarks = async (bot: Telegraf<MyContext<Update>>) => {
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
      const hasNextChapter = await checkIfUrlExist(url);
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

export default ScheduleUpdateBookmarks;
