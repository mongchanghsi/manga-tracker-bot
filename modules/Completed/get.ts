import { NarrowedContext, Context } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getUserId } from "../../utils/telegramHelper";
import userDb from "../../database/User";
import { BOOKMARK_NONE, NOT_REGISTERED } from "../../utils/messages";
import completedDb from "../../database/Completed";

const getResponseStringBookmark = (bookmarks: any[]) => {
  const _list = bookmarks
    .map(
      (bookmark) =>
        `${bookmark.id}. ${bookmark.name} - Chapter ${bookmark.latestChapter} - ${bookmark.url}`
    )
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

  const bookmarks = await completedDb.getCompletedList(userId);

  if (bookmarks.length > 0) {
    await ctx.replyWithHTML(getResponseStringBookmark(bookmarks), {
      link_preview_options: {
        is_disabled: true,
      },
    });
  } else {
    await ctx.reply(BOOKMARK_NONE);
  }
};
