import { NarrowedContext } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getMessage, getUserId } from "../../utils/telegramHelper";
import userDb from "../../database/User";
import { COMMANDS } from "../../utils/command";
import {
  BOOKMARK_ADD_RESPONSE_1,
  COMPLETED_ADD_SUCCESS,
  NOT_REGISTERED,
} from "../../utils/messages";
import { BookmarkSessionContext } from "../Bookmark/session";
import completedDb from "../../database/Completed";

export const AddCompletedCommand = async (
  ctx: NarrowedContext<BookmarkSessionContext, MountMap["text"]>
) => {
  const userId = getUserId(ctx as any);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(NOT_REGISTERED);
  }

  ctx.session.command = COMMANDS.ADD_COMPLETED;
  await ctx.reply(BOOKMARK_ADD_RESPONSE_1);
};

export const AddCompletedFollowup = async (ctx: any) => {
  const name = getMessage(ctx);
  await completedDb.addCompleted(getUserId(ctx), name);
  await ctx.reply(COMPLETED_ADD_SUCCESS);
  ctx.session.command = COMMANDS.START;
};
