import { NarrowedContext, Context, Telegraf, Markup, Types } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getUserId, getUserIdFromCallback } from "../../utils/telegramHelper";
import { Update } from "telegraf/typings/core/types/typegram";
import { COMMANDS } from "../../utils/command";
import userDb from "../../database/User";
import listDb from "../../database/List";

export const GetBookmarksCommand = async (
  ctx: NarrowedContext<Context, MountMap["text"]>
) => {
  const userId = getUserId(ctx);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(
      "Oh no, you're not registered yet. Type /start to continue"
    );
  }

  const bookmarks = await listDb.getBookmarks(userId);

  if (bookmarks && bookmarks.length > 0) {
    await ctx.reply(`Here's is the list`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Add ➕", callback_data: COMMANDS.ADD },
            { text: "Remove ❌", callback_data: COMMANDS.REMOVE },
          ],
        ],
      },
    });
  } else {
    await ctx.reply(
      `You don't have any bookmarked manga! Add one to get started`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: "Add ➕", callback_data: COMMANDS.ADD }]],
        },
      }
    );
  }
};

export const GetBookmarksAction = async (
  ctx: NarrowedContext<Context<Update>, Types.MountMap["callback_query"]>
) => {
  const userId = getUserIdFromCallback(ctx);
  const bookmarks = await listDb.getBookmarks(userId);

  if (bookmarks && bookmarks.length > 0) {
    await ctx.editMessageText(`Here's is the list`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Add ➕", callback_data: COMMANDS.ADD },
            { text: "Remove ❌", callback_data: COMMANDS.REMOVE },
          ],
        ],
      },
    });
  } else {
    await ctx.editMessageText(
      `You don't have any bookmarked manga! Add one to get started`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: "Add ➕", callback_data: COMMANDS.ADD }]],
        },
      }
    );
  }
  ctx.answerCbQuery();
};
