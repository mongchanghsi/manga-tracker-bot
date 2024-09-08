import { NarrowedContext, Context, Types } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import {
  getMessage,
  getUserId,
  getUserIdFromCallback,
} from "../../utils/telegramHelper";
import { Update } from "telegraf/typings/core/types/typegram";
import userDb from "../../database/User";
import { COMMANDS } from "../../utils/command";
import listDb from "../../database/List";

export type ADD_SESSION = {
  step: string;
  name: string;
  url: string;
  latestChapter: number;
};

export enum STEP {
  NAME = "name",
  URL = "url",
  CHAPTER = "chapter",
}

export const DEFAULT_ADD_SESSION = {
  step: STEP.NAME,
  name: "",
  url: "",
  latestChapter: 0,
};

// TODO Fix ctx typing to include sessions
export const AddBookmarksCommand = async (ctx: any) => {
  const userId = getUserId(ctx as any);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(
      "Oh no, you're not registered yet. Type /start to continue"
    );
  }

  ctx.session.command = COMMANDS.ADD;
  ctx.session.add.step = STEP.NAME;
  await ctx.reply("What is the name?");
};

export const AddBookmarksAction = async (ctx: any) => {
  ctx.session.command = COMMANDS.ADD;
  ctx.session.add.step = STEP.NAME;
  await ctx.reply("What is the name?");
  ctx.answerCbQuery();
};

export const AddBookmarksFollowup = async (ctx: any) => {
  if (ctx.session.add.step === STEP.NAME) {
    ctx.session.add.name = getMessage(ctx);
    ctx.session.add.step = STEP.URL;
    await ctx.reply("What is the URL of the latest chapter");
  } else if (ctx.session.add.step === STEP.URL) {
    ctx.session.add.url = getMessage(ctx);
    ctx.session.add.step = STEP.CHAPTER;
    await ctx.reply("What is latest chapter for this URL");
  } else if (ctx.session.add.step === STEP.CHAPTER) {
    ctx.session.add.latestChapter = getMessage(ctx);
    await listDb.addBookmark(
      getUserId(ctx),
      ctx.session.add.name,
      ctx.session.add.url,
      ctx.session.add.latestChapter
    );
    await ctx.reply("Added!");
    ctx.session.command = COMMANDS.START;
    ctx.session.add = DEFAULT_ADD_SESSION;
  }
};
