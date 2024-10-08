import { NarrowedContext, Context, Telegraf, Markup, Types } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getUserId, getUserIdFromCallback } from "../../utils/telegramHelper";
import { Update } from "telegraf/typings/core/types/typegram";
import { COMMANDS } from "../../utils/command";
import userDb from "../../database/User";
import listDb from "../../database/List";
import { BOOKMARK_NONE, NOT_REGISTERED } from "../../utils/messages";

const getResponseStringBookmark = (bookmarks: any[]) => {
  const _list = bookmarks
    .map(
      (bookmark) =>
        `${bookmark.id}. ${bookmark.name} - Chapter ${bookmark.latestChapter} - ${bookmark.url}`
    )
    .join(`\n`);
  return `Here's the list\n\n${_list}`;
};

export const GetBookmarksCommand = async (
  ctx: NarrowedContext<Context, MountMap["text"]>
) => {
  const userId = getUserId(ctx);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(NOT_REGISTERED);
  }

  const bookmarks = await listDb.getBookmarks(userId);

  if (bookmarks.length > 0) {
    await ctx.replyWithHTML(getResponseStringBookmark(bookmarks), {
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
  } else {
    await ctx.reply(BOOKMARK_NONE, {
      reply_markup: {
        inline_keyboard: [[{ text: "Add ➕", callback_data: COMMANDS.ADD }]],
      },
    });
  }
};

export const GetBookmarksAction = async (
  ctx: NarrowedContext<Context<Update>, Types.MountMap["callback_query"]>
) => {
  const userId = getUserIdFromCallback(ctx);
  const bookmarks = await listDb.getBookmarks(userId);

  if (bookmarks && bookmarks.length > 0) {
    await ctx.editMessageText(getResponseStringBookmark(bookmarks), {
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
  } else {
    await ctx.editMessageText(BOOKMARK_NONE, {
      reply_markup: {
        inline_keyboard: [[{ text: "Add ➕", callback_data: COMMANDS.ADD }]],
      },
    });
  }
  ctx.answerCbQuery();
};
