import { NarrowedContext } from "telegraf";
import { BookmarkSessionContext } from "../Bookmark/session";
import { MountMap } from "telegraf/typings/telegram-types";
import { getUserId } from "../../utils/telegramHelper";
import userDb from "../../database/User";
import { NOT_REGISTERED } from "../../utils/messages";

export const ToggleNotificationCommand = async (
  ctx: NarrowedContext<BookmarkSessionContext, MountMap["text"]>
) => {
  const userId = getUserId(ctx);

  const user = await userDb.getUser(userId);
  if (!user) {
    await ctx.reply(NOT_REGISTERED);
    return;
  }

  const response = await userDb.toggleUserNotification(user);
  if (response) {
    await ctx.reply(
      user.is_on
        ? "You will stop receiving alerts on new manga updates. Call the same command to turn it back on."
        : "You will start receiving alerts on new manga updates"
    );
  } else {
    await ctx.reply("Something went wrong. Please try again.");
  }
};
