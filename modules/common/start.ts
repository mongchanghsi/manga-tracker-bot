import { NarrowedContext, Context, Markup } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getFirstName, getUserId } from "../../utils/telegramHelper";
import { TOP_MANGA_LIST } from "../../utils/url";
import { COMMANDS } from "../../utils/command";
import userDb from "../../database/User";

const StartCommand = async (
  ctx: NarrowedContext<Context, MountMap["text"]>
) => {
  const userId = getUserId(ctx);
  const firstName = getFirstName(ctx);

  const user = await userDb.getUser(userId);
  if (!user) {
    await userDb.createUser(userId);
  }

  const responseMessage = user
    ? `Welcome back ${firstName}! Select one of the options to get started!`
    : `Hey ${firstName}! Welcome to Manga Tracker Bot!\n\nThis bots sends you a notification whenever your bookmarked manga has a new release!\n\nIt works by tracking the latest chapter + 1 based from the URL you provide, so you will have to provide a URL that contains the chapter number! (MangaDEX doesn't work. Recommended kunmanga/mangafire/kingofshojo/manhuaus).\nOther individual sites such as https://standardsofreincarnation.com may or may not work all the time, if it doesn't leave a /feedback`;

  await ctx.reply(responseMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Add ➕", callback_data: COMMANDS.ADD },
          { text: "Bookmarked ⭐", callback_data: `${COMMANDS.LIST}:0` },
        ],
        [
          Markup.button.url("Look for top manga to read", TOP_MANGA_LIST),
          { text: "Help ℹ️", callback_data: COMMANDS.HELP },
        ],
      ],
    },
  });
};

export default StartCommand;
