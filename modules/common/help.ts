import { Context, NarrowedContext } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import * as tt from "telegraf/typings/telegram-types";

const responseMessage = `Get started with /list /add and /remove\n\nStart tracking your favourite manga on their own site. Take note that this will not work accurately as different manga site handles their new chapter differently!`;

export const HelpCommand = async (
  ctx: NarrowedContext<Context, MountMap["text"]>
) => {
  ctx.reply(responseMessage);
};

export const HelpAction = async (
  ctx: NarrowedContext<
    Context & { match: RegExpExecArray },
    tt.MountMap[tt.UpdateType]
  >
) => {
  ctx.answerCbQuery();
  ctx.reply(responseMessage);
};
