/* eslint-disable @typescript-eslint/no-explicit-any */
import { Telegraf } from "telegraf";

export const BotSendMessage = (
  bot: Telegraf<any>,
  telegramId: string,
  message: string,
  args: any
) => {
  try {
    bot.telegram.sendMessage(telegramId, message, args);
  } catch (error) {
    console.log("Bot Sending Message Error: ", error);
  }
};
