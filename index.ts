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
import { initStayAlive } from "./modules/Scheduler/stayAlive";
import { RefreshBookmarksAction } from "./modules/Bookmark/refresh";
import { FeedbackCommand, FeedbackFollowup } from "./modules/common/feedback";
import {
  AddCompletedCommand,
  AddCompletedFollowup,
} from "./modules/Completed/add";
import {
  RemoveCompletedCommand,
  RemoveCompletedFollowup,
} from "./modules/Completed/delete";
import { GetCompletedCommand } from "./modules/Completed/get";

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

bot.action(COMMANDS.REFRESH, RefreshBookmarksAction);

bot.command(COMMANDS.FEEDBACK, FeedbackCommand);

bot.command(COMMANDS.HELP, HelpCommand);
bot.action(COMMANDS.HELP, HelpAction);

bot.command(COMMANDS.GET_COMPLETED, GetCompletedCommand);
bot.command(COMMANDS.ADD_COMPLETED, AddCompletedCommand);
bot.command(COMMANDS.REMOVE_COMPLETED, RemoveCompletedCommand);

bot.on("text", (ctx) => {
  if (ctx.session.command === COMMANDS.ADD) {
    AddBookmarksFollowup(ctx);
  }
  if (ctx.session.command === COMMANDS.REMOVE) {
    RemoveBookmarksFollowup(ctx);
  }
  if (ctx.session.command === COMMANDS.FEEDBACK) {
    FeedbackFollowup(ctx);
  }
  if (ctx.session.command === COMMANDS.ADD_COMPLETED) {
    AddCompletedFollowup(ctx);
  }
  if (ctx.session.command === COMMANDS.REMOVE_COMPLETED) {
    RemoveCompletedFollowup(ctx);
  }
});

bot.telegram.setMyCommands(CommandList);

const PORT = 3000;
const WEBHOOK_DOMAIN = ENVIRONMENT.WEBHOOK_DOMAIN;

const args = process.argv;

if (args[args.length - 1] === "--local") {
  bot.launch();
  console.log("Bot started locally");
} else {
  bot
    .launch({ webhook: { domain: WEBHOOK_DOMAIN, port: PORT } })
    .then(() => console.log("Webhook bot listening on port", PORT));
  initCronJob(bot);
  initStayAlive();
}

app.get("/", (req, res) => {
  res.send("Bot is healthy!");
});
