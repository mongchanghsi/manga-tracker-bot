import { NarrowedContext, Context, Types } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getUserId, getUserIdFromCallback } from "../../utils/telegramHelper";
import { Update } from "telegraf/typings/core/types/typegram";
import { COMMANDS } from "../../utils/command";
import userDb from "../../database/User";
import listDb, { PAGE_SIZE } from "../../database/List";
import { BOOKMARK_NONE, NOT_REGISTERED } from "../../utils/messages";
import { INLINE_KEYBOARD } from "../../utils/types";

const DEFAULT_GET_INLINE_KEYBOARD_COMMANDS: INLINE_KEYBOARD = [
  [
    { text: "Add ➕", callback_data: COMMANDS.ADD },
    { text: "Remove ❌", callback_data: COMMANDS.REMOVE },
  ],
  [{ text: "Refresh 🔄", callback_data: COMMANDS.REFRESH }],
];

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
    // Only need to handle first page - index-based pages
    let command = [...DEFAULT_GET_INLINE_KEYBOARD_COMMANDS];
    if (bookmarks.length >= PAGE_SIZE) {
      command = [
        [{ text: "Next ➡️", callback_data: `${COMMANDS.LIST}:1` }],
        ...command,
      ];
    }

    await ctx.replyWithHTML(getResponseStringBookmark(bookmarks), {
      reply_markup: {
        inline_keyboard: DEFAULT_GET_INLINE_KEYBOARD_COMMANDS,
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
  const pageNumber = (ctx as Context<Update> & { match: RegExpExecArray })
    .match[1];
  const bookmarks = await listDb.getBookmarks(userId, +pageNumber);

  if (bookmarks && bookmarks.length > 0) {
    let command = [...DEFAULT_GET_INLINE_KEYBOARD_COMMANDS];
    const hasNextPage = bookmarks.length === PAGE_SIZE;
    const hasPrevPage = +pageNumber > 0;
    const pageCommand = [];
    if (hasPrevPage)
      pageCommand.push({
        text: "Previous ⬅️",
        callback_data: `${COMMANDS.LIST}:${+pageNumber - 1}`,
      });

    if (hasNextPage) {
      pageCommand.push({
        text: "Next ➡️",
        callback_data: `${COMMANDS.LIST}:${+pageNumber + 1}`,
      });
    }

    if (pageCommand.length > 0) {
      command = [pageCommand, ...command];
    }

    await ctx.editMessageText(getResponseStringBookmark(bookmarks), {
      reply_markup: {
        inline_keyboard: command,
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
