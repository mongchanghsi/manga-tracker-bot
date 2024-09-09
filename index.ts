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
  AddBookmarksAction,
  AddBookmarksCommand,
  AddBookmarksFollowup,
} from "./modules/Bookmark/add";
import {
  RemoveBookmarksAction,
  RemoveBookmarksCommand,
  RemoveBookmarksFollowup,
} from "./modules/Bookmark/delete";
import {
  DEFAULT_ADD_SESSION,
  BookmarkSessionContext,
} from "./modules/Bookmark/session";
import { initCronJob } from "./modules/Scheduler";
import express from "express";

const app = express();

const bot = new Telegraf<BookmarkSessionContext>(ENVIRONMENT.BOT_TOKEN);

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

bot.command(COMMANDS.REMOVE, RemoveBookmarksCommand);
bot.action(COMMANDS.REMOVE, RemoveBookmarksAction);

bot.command(COMMANDS.HELP, HelpCommand);
bot.action(COMMANDS.HELP, HelpAction);

bot.on("text", (ctx) => {
  if (ctx.session.command === COMMANDS.ADD) {
    AddBookmarksFollowup(ctx);
  }
  if (ctx.session.command === COMMANDS.REMOVE) {
    RemoveBookmarksFollowup(ctx);
  }
});

bot.telegram.setMyCommands(CommandList);

const PORT = 3000;
const WEBHOOK_DOMAIN = ENVIRONMENT.WEBHOOK_DOMAIN;
bot
  .launch({ webhook: { domain: WEBHOOK_DOMAIN, port: PORT } })
  .then(() => console.log("Webhook bot listening on port", PORT));
initCronJob(bot);

app.get("/", (req, res) => {
  res.send("Bot is healthy!");
});
