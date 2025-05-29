import { Context, NarrowedContext, Types } from "telegraf";
import { getUserId, getUserIdFromCallback } from "../../utils/telegramHelper";
import listDb, { PAGE_SIZE } from "../../database/List";
import { BookmarkSessionContext } from "./session";
import { Update } from "telegraf/types";
import { checkIfUrlExistV2 } from "../../utils/checker";
import { COMMANDS } from "../../utils/command";
import { Bookmark } from "../../utils/types";
import { DEFAULT_GET_INLINE_KEYBOARD_COMMANDS } from "../common/commands";
import userDb from "../../database/User";
import { NOT_REGISTERED } from "../../utils/messages";
import { CheckLatestChapter } from "../Scheduler";
import bot from "../common/init-bot";

const getResponseStringBookmark = (bookmarks: Bookmark[], page: number = 0) => {
  const _list = bookmarks
    .map(
      (bookmark) =>
        `${bookmark.id}. ${bookmark.name} - Chapter ${bookmark.latestChapter} - ${bookmark.url}`
    )
    .join(`\n`);
  return `Here's the refreshed list - Page ${page + 1}\n\n${_list}`;
};

export const RefreshBookmarkCommand = async (
  ctx: NarrowedContext<Context<Update>, Types.MountMap["text"]>
) => {
  console.log("Refresh started");
  const userId = getUserId(ctx);
  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(NOT_REGISTERED);
    return;
  }

  const bookmarks = await listDb.getAllBookmarks(userId);
  await CheckLatestChapter(bot, user.telegramId, bookmarks);
  console.log("Refresh ended");
  ctx.sendMessage("Refresh completed");
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
    const validation = await checkIfUrlExistV2(url, chapterToLookFor);
    if (validation === 500) {
      console.log("🔴 There is an issue with this URL ", `- ${url}`);
    } else {
      console.log(validation ? "🟢" : `🔴`, `- ${url}`);
      if (validation.length > 0) {
        console.log(validation.join("|"));
      } else {
        await listDb.updateBookmark(_bookmark.id, chapterToLookFor);
      }
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
