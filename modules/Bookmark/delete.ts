import { getMessage, getUserId } from "../../utils/telegramHelper";
import userDb from "../../database/User";
import { COMMANDS } from "../../utils/command";
import listDb from "../../database/List";
import { MountMap } from "telegraf/typings/telegram-types";
import { NarrowedContext, Types } from "telegraf";
import { BookmarkSessionContext } from "./session";
import { Update } from "telegraf/types";
import {
  BOOKMARK_REMOVE_ERROR_1,
  BOOKMARK_REMOVE_RESPONSE_1,
  BOOKMARK_REMOVE_SUCCESS,
  GENERIC_ERROR,
  NOT_REGISTERED,
} from "../../utils/messages";

export const RemoveBookmarksCommand = async (
  ctx: NarrowedContext<BookmarkSessionContext, MountMap["text"]>
) => {
  const userId = getUserId(ctx as any);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(NOT_REGISTERED);
  }

  ctx.session.command = COMMANDS.REMOVE;
  await ctx.reply(BOOKMARK_REMOVE_RESPONSE_1);
};

export const RemoveBookmarksAction = async (
  ctx: NarrowedContext<
    BookmarkSessionContext<Update>,
    Types.MountMap["callback_query"]
  >
) => {
  ctx.session.command = COMMANDS.REMOVE;
  await ctx.reply(BOOKMARK_REMOVE_RESPONSE_1);
  ctx.answerCbQuery();
};

export const RemoveBookmarksFollowup = async (ctx: any) => {
  const userId = getUserId(ctx);
  const mangaId = getMessage(ctx);
  const data = await listDb.getBookmark(userId, +mangaId);

  if (data) {
    const success = await listDb.removeBookmark(userId, +mangaId);
    if (success) return ctx.reply(BOOKMARK_REMOVE_SUCCESS);
    return ctx.reply(GENERIC_ERROR);
  } else {
    ctx.reply(BOOKMARK_REMOVE_ERROR_1);
  }
  ctx.session.command = COMMANDS.START;
};
