import { NarrowedContext, Context, Telegraf, Markup } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import {
  getChatId,
  getFirstName,
  getUsername,
} from "../../utils/telegramHelper";
import { Update } from "telegraf/typings/core/types/typegram";
import { MY_ANIME_LIST_URL } from "../../utils/url";
import { COMMANDS } from "../../utils/command";

const StartCommand = async (
  bot: Telegraf<Context<Update>>,
  ctx: NarrowedContext<Context, MountMap["text"]>
) => {
  const username = getUsername(ctx);
  const firstName = getFirstName(ctx);
  // Check whether is user registered
  console.log({
    firstName,
    username,
  });
  bot.telegram.sendMessage(
    getChatId(ctx),
    `Welcome to Manga Tracker Bot!\n\nThis bots sends you a notification whenever your bookmarked manga has a new release!\n\nPS: This is mainly to track on individual sites, and each individual sites has a different way of handling their manga pages, so it may not work all the time!
    `,
    {
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
    }
  );
};

export default StartCommand;
