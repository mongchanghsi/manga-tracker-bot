import { NarrowedContext, Context, Types } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getMessage, getUserId } from "../../utils/telegramHelper";
import userDb from "../../database/User";
import { COMMANDS } from "../../utils/command";
import listDb from "../../database/List";
import { BookmarkSessionContext, DEFAULT_ADD_SESSION, STEP } from "./session";
import { Update } from "telegraf/types";
import {
  BOOKMARK_ADD_RESPONSE_1,
  BOOKMARK_ADD_RESPONSE_2,
  BOOKMARK_ADD_RESPONSE_3,
  BOOKMARK_ADD_SUCCESS,
  NOT_REGISTERED,
} from "../../utils/messages";

export const AddBookmarksCommand = async (
  ctx: NarrowedContext<BookmarkSessionContext, MountMap["text"]>
) => {
  const userId = getUserId(ctx as any);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(NOT_REGISTERED);
  }

  ctx.session.command = COMMANDS.ADD;
  ctx.session.add.step = STEP.NAME;
  await ctx.reply(BOOKMARK_ADD_RESPONSE_1);
};

export const AddBookmarksAction = async (
  ctx: NarrowedContext<
    BookmarkSessionContext<Update>,
    Types.MountMap["callback_query"]
  >
) => {
  ctx.session.command = COMMANDS.ADD;
  ctx.session.add.step = STEP.NAME;
  await ctx.reply(BOOKMARK_ADD_RESPONSE_1);
  ctx.answerCbQuery();
};

export const AddBookmarksFollowup = async (ctx: any) => {
  if (ctx.session.add.step === STEP.NAME) {
    ctx.session.add.name = getMessage(ctx);
    ctx.session.add.step = STEP.URL;
    await ctx.reply(BOOKMARK_ADD_RESPONSE_2);
  } else if (ctx.session.add.step === STEP.URL) {
    ctx.session.add.url = getMessage(ctx);
    ctx.session.add.step = STEP.CHAPTER;
    await ctx.reply(BOOKMARK_ADD_RESPONSE_3);
  } else if (ctx.session.add.step === STEP.CHAPTER) {
    ctx.session.add.latestChapter = getMessage(ctx);
    await listDb.addBookmark(
      getUserId(ctx),
      ctx.session.add.name,
      ctx.session.add.url,
      ctx.session.add.latestChapter
    );
    await ctx.reply(BOOKMARK_ADD_SUCCESS);
    ctx.session.command = COMMANDS.START;
    ctx.session.add = DEFAULT_ADD_SESSION;
  }
};
