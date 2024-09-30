import { NarrowedContext, Context } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getUserId } from "../../utils/telegramHelper";
import userDb from "../../database/User";
import { COMPLETED_NONE, NOT_REGISTERED } from "../../utils/messages";
import completedDb from "../../database/Completed";

const getResponseStringBookmark = (completeds: any[]) => {
  const _list = completeds
    .map((completed) => `${completed.id}. ${completed.name}`)
    .join(`\n`);
  return `Here's the list\n\n${_list}`;
};

export const GetCompletedCommand = async (
  ctx: NarrowedContext<Context, MountMap["text"]>
) => {
  const userId = getUserId(ctx);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(NOT_REGISTERED);
  }

  const completeds = await completedDb.getCompletedList(userId);

  if (completeds.length > 0) {
    await ctx.replyWithHTML(getResponseStringBookmark(completeds), {
      link_preview_options: {
        is_disabled: true,
      },
    });
  } else {
    await ctx.reply(COMPLETED_NONE);
  }
};
