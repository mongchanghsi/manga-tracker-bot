import { NarrowedContext, Types } from "telegraf";
import { getUserIdFromCallback } from "../../utils/telegramHelper";
import listDb from "../../database/List";
import { BookmarkSessionContext } from "./session";
import { Update } from "telegraf/types";
import { checkIfUrlExist } from "../../utils/checker";
import { COMMANDS } from "../../utils/command";

const getResponseStringBookmark = (bookmarks: any[]) => {
  const _list = bookmarks
    .map(
      (bookmark) =>
        `${bookmark.id}. ${bookmark.name} - Chapter ${bookmark.latestChapter} - ${bookmark.url}`
    )
    .join(`\n`);
  return `Here's the refreshed list\n\n${_list}`;
};

export const RefreshBookmarksAction = async (
  ctx: NarrowedContext<
    BookmarkSessionContext<Update>,
    Types.MountMap["callback_query"]
  >
) => {
  const userId = getUserIdFromCallback(ctx);
  const bookmarks = await listDb.getBookmarks(userId);

  await ctx.editMessageText("Refreshing...");

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
      await listDb.updateBookmark(_bookmark.id, chapterToLookFor);
    }
  });

  const refreshedBookmarks = await listDb.getBookmarks(userId);
  await ctx.editMessageText(getResponseStringBookmark(refreshedBookmarks), {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Add ➕", callback_data: COMMANDS.ADD },
          { text: "Remove ❌", callback_data: COMMANDS.REMOVE },
        ],
        [{ text: "Refresh 🔄", callback_data: COMMANDS.REFRESH }],
      ],
    },
    link_preview_options: {
      is_disabled: true,
    },
  });

  ctx.answerCbQuery();
};
