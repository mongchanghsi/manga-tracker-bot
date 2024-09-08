import { NarrowedContext, Context, Telegraf, Markup } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getChatId, getFirstName, getUserId } from "../../utils/telegramHelper";
import { Update } from "telegraf/typings/core/types/typegram";
import { MY_ANIME_LIST_URL } from "../../utils/url";
import { COMMANDS } from "../../utils/command";
import userDb from "../../database/User";

const StartCommand = async (
  bot: Telegraf<Context<Update>>,
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
    : `Hey ${firstName}! Welcome to Manga Tracker Bot!\n\nThis bots sends you a notification whenever your bookmarked manga has a new release!\n\nPS: This is mainly to track on individual sites, and each individual sites has a different way of handling their manga pages, so it may not work all the time!`;

  bot.telegram.sendMessage(getChatId(ctx), responseMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Add ➕", callback_data: COMMANDS.ADD },
          { text: "Bookmarked ⭐", callback_data: COMMANDS.LIST },
        ],
        [
          Markup.button.url("Look for latest anime", MY_ANIME_LIST_URL),
          { text: "Help ℹ️", callback_data: COMMANDS.HELP },
        ],
      ],
    },
  });
};

export default StartCommand;
