import { NarrowedContext, Types } from "telegraf";
import { getUserIdFromCallback } from "../../utils/telegramHelper";
import listDb, { PAGE_SIZE } from "../../database/List";
import { BookmarkSessionContext } from "./session";
import { Update } from "telegraf/types";
import { checkIfUrlExist } from "../../utils/checker";
import { COMMANDS } from "../../utils/command";
import { Bookmark } from "../../utils/types";
import { DEFAULT_GET_INLINE_KEYBOARD_COMMANDS } from "../common/commands";

const getResponseStringBookmark = (bookmarks: Bookmark[], page: number = 0) => {
  const _list = bookmarks
    .map(
      (bookmark) =>
        `${bookmark.id}. ${bookmark.name} - Chapter ${bookmark.latestChapter} - ${bookmark.url}`
    )
    .join(`\n`);
  return `Here's the refreshed list - Page ${page + 1}\n\n${_list}`;
};

export const RefreshBookmarksAction = async (
  ctx: NarrowedContext<
    BookmarkSessionContext<Update>,
    Types.MountMap["callback_query"]
  >
) => {
  const userId = getUserIdFromCallback(ctx);
  const pageNumber = (
    ctx as BookmarkSessionContext<Update> & { match: RegExpExecArray }
  ).match[1];
  const bookmarks = await listDb.getAllBookmarks(userId);

  await ctx.editMessageText("Refreshing...");

  for (const _bookmark of bookmarks) {
    const chapterToLookFor = _bookmark.latestChapter + 1;
    const url = _bookmark.url.replace(
      _bookmark.latestChapter.toString(),
      chapterToLookFor.toString()
    );
    console.log(`Checking ${url}`);
    const hasNextChapter = await checkIfUrlExist(url, chapterToLookFor);
    console.log(hasNextChapter ? "🟢" : `🔴`, `- ${url}`);

    if (hasNextChapter !== 500 && hasNextChapter) {
      await listDb.updateBookmark(_bookmark.id, chapterToLookFor);
    }
  }

  const refreshedBookmarks = await listDb.getBookmarks(userId);

  if (refreshedBookmarks && refreshedBookmarks.length > 0) {
    const totalBookmarkCount =
      (await listDb.getTotalBookmarkCount(userId)) || 0;
    const hasMore = totalBookmarkCount > (+pageNumber + 1) * PAGE_SIZE;

    let command = [...DEFAULT_GET_INLINE_KEYBOARD_COMMANDS];
    const hasPrevPage = +pageNumber > 0;
    const pageCommand = [];
    if (hasPrevPage)
      pageCommand.push({
        text: "Previous ⬅️",
        callback_data: `${COMMANDS.LIST}:${+pageNumber - 1}`,
      });

    if (hasMore) {
      pageCommand.push({
        text: "Next ➡️",
        callback_data: `${COMMANDS.LIST}:${+pageNumber + 1}`,
      });
    }

    if (pageCommand.length > 0) {
      command = [pageCommand, ...command];
    }

    await ctx.editMessageText(getResponseStringBookmark(refreshedBookmarks), {
      reply_markup: {
        inline_keyboard: command,
      },
      link_preview_options: {
        is_disabled: true,
      },
    });

    ctx.answerCbQuery();
  }
};
