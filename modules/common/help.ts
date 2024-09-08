import { Context, NarrowedContext } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import * as tt from "telegraf/typings/telegram-types";

export const HelpCommand = async (
  ctx: NarrowedContext<Context, MountMap["text"]>
) => {
  ctx.reply("Help");
};

export const HelpAction = async (
  ctx: NarrowedContext<
    Context & { match: RegExpExecArray },
    tt.MountMap[tt.UpdateType]
  >
) => {
  ctx.answerCbQuery();
  ctx.reply("Help");
};
