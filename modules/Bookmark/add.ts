import { NarrowedContext, Context, Telegraf, Markup, Types } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getUserId, getUserIdFromCallback } from "../../utils/telegramHelper";
import { Update } from "telegraf/typings/core/types/typegram";
import userDb from "../../database/User";

export const AddBookmarksCommand = async (
  ctx: NarrowedContext<Context, any>
) => {
  const userId = getUserId(ctx as any);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(
      "Oh no, you're not registered yet. Type /start to continue"
    );
  }
};

export const AddBookmarksAction = async (
  ctx: NarrowedContext<Context<Update>, Types.MountMap["callback_query"]>
) => {
  const userId = getUserIdFromCallback(ctx);

  ctx.answerCbQuery();
};
