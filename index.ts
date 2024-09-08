import { Telegraf, session, type Context } from "telegraf";
import ENVIRONMENT from "./configuration/environment";
import { COMMANDS } from "./utils/command";
import CommandList from "./utils/commandShortcutMenu";
import StartCommand from "./modules/common/start";
import { HelpAction, HelpCommand } from "./modules/common/help";
import {
  GetBookmarksAction,
  GetBookmarksCommand,
} from "./modules/Bookmark/get";
import {
  ADD_SESSION,
  AddBookmarksAction,
  AddBookmarksCommand,
  AddBookmarksFollowup,
  DEFAULT_ADD_SESSION,
} from "./modules/Bookmark/add";

import type { Update } from "telegraf/types";

interface MyContext<U extends Update = Update> extends Context<U> {
  session: {
    command: COMMANDS;
    add: ADD_SESSION;
  };
}

const bot = new Telegraf<MyContext>(ENVIRONMENT.BOT_TOKEN);

bot.use(
  session({
    defaultSession: () => ({
      command: COMMANDS.START,
      add: DEFAULT_ADD_SESSION,
    }),
  })
);

bot.start(StartCommand);
bot.command(COMMANDS.START, StartCommand);
bot.command(COMMANDS.LIST, GetBookmarksCommand);
bot.action(COMMANDS.LIST, GetBookmarksAction);
bot.command(COMMANDS.ADD, AddBookmarksCommand);
bot.action(COMMANDS.ADD, AddBookmarksAction);
bot.command(COMMANDS.HELP, HelpCommand);
bot.action("help", HelpAction);

bot.on("text", (ctx) => {
  if (ctx.session.command === COMMANDS.ADD) {
    AddBookmarksFollowup(ctx);
  }
});

bot.telegram.setMyCommands(CommandList);
bot.launch();
