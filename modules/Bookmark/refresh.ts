import { Context, NarrowedContext, Types } from "telegraf";
import { getUserId, getUserIdFromCallback } from "../../utils/telegramHelper";
import listDb, { PAGE_SIZE } from "../../database/List";
import { BookmarkSessionContext } from "./session";
import { Update } from "telegraf/types";
import { COMMANDS } from "../../utils/command";
import { Bookmark } from "../../utils/types";
import { DEFAULT_GET_INLINE_KEYBOARD_COMMANDS } from "../common/commands";
import userDb from "../../database/User";
import { NOT_REGISTERED } from "../../utils/messages";
import bot from "../common/init-bot";
import {
  CheckMultiAndUpdate,
  CheckMultiAndUpdateAndSend,
} from "../../utils/checkAndSend";

const refreshLocks = new Map<number, boolean>();

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
  if (ctx.message.from.is_bot) return;

  const userId = getUserId(ctx);

  if (refreshLocks.get(userId)) {
    return;
  }
  refreshLocks.set(userId, true);

  try {
    console.log("Refresh started");

    // ✅ Immediately respond
    await ctx.reply("🔄 Refreshing bookmarks in the background...");

    // Do not block — offload the heavy operation
    setTimeout(async () => {
      try {
        const user = await userDb.getUser(userId);
        if (!user) {
          await ctx.reply(NOT_REGISTERED);
          return;
        }

        const bookmarks = await listDb.getAllBookmarks(userId);
        await CheckMultiAndUpdateAndSend(bot, user, bookmarks);

        console.log("Refresh ended");
        await bot.telegram.sendMessage(
          user.telegramId,
          "✅ Refresh completed."
        );
      } catch (err) {
        console.error("Refresh error:", err);
        await bot.telegram.sendMessage(
          userId,
          "❌ Refresh failed due to an error."
        );
      } finally {
        refreshLocks.delete(userId);
      }
    }, 0); // Offload to next tick
  } catch (err) {
    console.error("Top-level refresh error:", err);
    refreshLocks.delete(userId);
  }
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
  await CheckMultiAndUpdate(bookmarks);

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
