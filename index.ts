import { Telegraf } from "telegraf";
import ENVIRONMENT from "./configuration/environment";
import { COMMANDS } from "./utils/command";
import CommandList from "./utils/commandShortcutMenu";
import StartCommand from "./modules/common/start";
import { HelpAction, HelpCommand } from "./modules/common/help";
import {
  GetBookmarksAction,
  GetBookmarksCommand,
} from "./modules/Bookmark/get";

const bot = new Telegraf(ENVIRONMENT.BOT_TOKEN);

bot.start(StartCommand);
bot.command(COMMANDS.START, StartCommand);
bot.command(COMMANDS.LIST, GetBookmarksCommand);
bot.action(COMMANDS.LIST, GetBookmarksAction);
bot.command(COMMANDS.HELP, HelpCommand);
bot.action("help", HelpAction);

bot.telegram.setMyCommands(CommandList);
bot.launch();
