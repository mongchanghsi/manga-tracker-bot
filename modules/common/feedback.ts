import { NarrowedContext } from "telegraf";
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
import { BookmarkSessionContext } from "../Bookmark/session";
import { Message, Update } from "telegraf/types";

export const FeedbackCommand = async (
  ctx: NarrowedContext<BookmarkSessionContext, MountMap["text"]>
) => {
  const userId = getUserId(ctx);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(NOT_REGISTERED);
  }

  ctx.session.command = COMMANDS.FEEDBACK;
  await ctx.reply(FEEDBACK_RESPONSE_1);
};

export const FeedbackFollowup = async (
  ctx: NarrowedContext<
    BookmarkSessionContext<Update>,
    {
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }
  >
) => {
  const userId = getUserId(ctx);
  const message = getMessage(ctx);
  const success = await feedbackDb.addFeedback(userId, message);
  await ctx.reply(success ? FEEDBACK_SUCCESS : GENERIC_ERROR);
  ctx.session.command = COMMANDS.START;
};
