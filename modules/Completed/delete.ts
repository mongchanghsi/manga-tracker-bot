import { getMessage, getUserId } from "../../utils/telegramHelper";
import userDb from "../../database/User";
import { COMMANDS } from "../../utils/command";
import { MountMap } from "telegraf/typings/telegram-types";
import { NarrowedContext } from "telegraf";
import {
  BOOKMARK_REMOVE_ERROR_1,
  BOOKMARK_REMOVE_RESPONSE_1,
  BOOKMARK_REMOVE_SUCCESS,
  GENERIC_ERROR,
  NOT_REGISTERED,
} from "../../utils/messages";
import { BookmarkSessionContext } from "../Bookmark/session";
import completedDb from "../../database/Completed";
import { Message, Update } from "telegraf/types";

export const RemoveCompletedCommand = async (
  ctx: NarrowedContext<BookmarkSessionContext, MountMap["text"]>
) => {
  const userId = getUserId(ctx);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(NOT_REGISTERED);
  }

  ctx.session.command = COMMANDS.REMOVE_COMPLETED;
  await ctx.reply(BOOKMARK_REMOVE_RESPONSE_1);
};

export const RemoveCompletedFollowup = async (
  ctx: NarrowedContext<
    BookmarkSessionContext<Update>,
    {
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }
  >
) => {
  const userId = getUserId(ctx);
  const mangaId = getMessage(ctx);
  const data = await completedDb.getCompleted(userId, +mangaId);

  if (data) {
    const success = await completedDb.removeCompleted(userId, +mangaId);
    if (success) return ctx.reply(BOOKMARK_REMOVE_SUCCESS);
    return ctx.reply(GENERIC_ERROR);
  } else {
    ctx.reply(BOOKMARK_REMOVE_ERROR_1);
  }
  ctx.session.command = COMMANDS.START;
};
