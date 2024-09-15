import { NarrowedContext, Context } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getMessage, getUserId } from "../../utils/telegramHelper";
import { COMMANDS } from "../../utils/command";
import userDb from "../../database/User";
import feedbackDb from "../../database/Feedback";
import {
  FEEDBACK_RESPONSE_1,
  FEEDBACK_SUCCESS,
  GENERIC_ERROR,
  NOT_REGISTERED,
} from "../../utils/messages";

export const FeedbackCommand = async (
  ctx: NarrowedContext<Context, MountMap["text"]>
) => {
  const userId = getUserId(ctx as any);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(NOT_REGISTERED);
  }

  await ctx.reply(FEEDBACK_RESPONSE_1);
};

export const FeedbackFollowup = async (ctx: any) => {
  const userId = getUserId(ctx);
  const message = getMessage(ctx);
  const success = await feedbackDb.addFeedback(userId, message);
  await ctx.reply(success ? FEEDBACK_SUCCESS : GENERIC_ERROR);
  ctx.session.command = COMMANDS.START;
};
