import { Telegraf } from "telegraf";
import ENVIRONMENT from "./configuration/environment";
import { COMMANDS } from "./utils/command";
import CommandList from "./utils/commandShortcutMenu";
import StartCommand from "./modules/common/start";
import { HelpAction, HelpCommand } from "./modules/common/help";

const bot = new Telegraf(ENVIRONMENT.BOT_TOKEN);

bot.command(COMMANDS.START, (ctx) => StartCommand(bot, ctx));
bot.command(COMMANDS.HELP, HelpCommand);
bot.action("help", HelpAction);

bot.telegram.setMyCommands(CommandList);
bot.launch();
