import { getMessage, getUserId } from "../../utils/telegramHelper";
import userDb from "../../database/User";
import { COMMANDS } from "../../utils/command";
import listDb from "../../database/List";
import { MountMap } from "telegraf/typings/telegram-types";
import { NarrowedContext, Types } from "telegraf";
import { BookmarkSessionContext } from "./session";
import { Update } from "telegraf/types";

export const RemoveBookmarksCommand = async (
  ctx: NarrowedContext<BookmarkSessionContext, MountMap["text"]>
) => {
  const userId = getUserId(ctx as any);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(
      "Oh no, you're not registered yet. Type /start to continue"
    );
  }

  ctx.session.command = COMMANDS.REMOVE;
  await ctx.reply("Please provide the ID of the manga that you want to remove");
};

export const RemoveBookmarksAction = async (
  ctx: NarrowedContext<
    BookmarkSessionContext<Update>,
    Types.MountMap["callback_query"]
  >
) => {
  ctx.session.command = COMMANDS.REMOVE;
  await ctx.reply("Please provide the ID of the manga that you want to remove");
  ctx.answerCbQuery();
};

export const RemoveBookmarksFollowup = async (ctx: any) => {
  const userId = getUserId(ctx);
  const mangaId = getMessage(ctx);
  const data = await listDb.getBookmark(userId, +mangaId);

  if (data) {
    const success = await listDb.removeBookmark(userId, +mangaId);
    if (success) return ctx.reply("Successfully removed!");
    return ctx.reply("Something went wrong. Please try again.");
  } else {
    ctx.reply(
      "No manga ID found. Please key in the correct manga ID from /list"
    );
  }
  ctx.session.command = COMMANDS.START;
};
