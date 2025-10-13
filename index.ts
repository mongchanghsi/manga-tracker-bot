import { session } from "telegraf";
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
import { DEFAULT_ADD_SESSION, STEP } from "./modules/Bookmark/session";
import { initCronJob } from "./modules/Scheduler";
import express from "express";
import { initStayAlive } from "./modules/Scheduler/stayAlive";
import { RefreshBookmarkCommand } from "./modules/Bookmark/refresh";
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
import { RecommendCommand } from "./modules/common/recommend";
import bot from "./modules/common/init-bot";
import bodyParser from "body-parser";
import announcementRoutes from "./modules/Announcement/routes";
import localTestRoutes from "./modules/LocalTest/routes";
import { SOURCE } from "./utils/types";
import {
  BOOKMARK_ADD_ASK_URL_WITH_CHAPTER,
  BOOKMARK_ADD_COMICK,
  BOOKMARK_ADD_HARIMANGA,
  BOOKMARK_ADD_MANGADEX,
  BOOKMARK_ADD_MANHUAPLUS,
  BOOKMARK_ADD_MANHUAUS,
  BOOKMARK_ADD_WEBTOONS,
  BOOKMARK_ADD_XBATO,
} from "./utils/messages";
import { ToggleNotificationCommand } from "./modules/common/notification";

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Bot is healthy!");
});

app.use("/api/v1", announcementRoutes);
app.use("/api/v1", localTestRoutes);

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
bot.action(/list:(\d+)/, GetBookmarksAction);

bot.command(COMMANDS.ADD, AddBookmarksCommand);
bot.action(COMMANDS.ADD, AddBookmarksAction);

bot.command(COMMANDS.REMOVE, RemoveBookmarksCommand);
bot.action(COMMANDS.REMOVE, RemoveBookmarksAction);

bot.command(COMMANDS.REFRESH, RefreshBookmarkCommand);
// bot.action(COMMANDS.REFRESH, RefreshBookmarksAction);

bot.command(COMMANDS.FEEDBACK, FeedbackCommand);

bot.command(COMMANDS.HELP, HelpCommand);
bot.action(COMMANDS.HELP, HelpAction);

bot.command(COMMANDS.GET_COMPLETED, GetCompletedCommand);
bot.command(COMMANDS.ADD_COMPLETED, AddCompletedCommand);
bot.command(COMMANDS.REMOVE_COMPLETED, RemoveCompletedCommand);

bot.command(COMMANDS.RECOMMEND, RecommendCommand);

bot.command(COMMANDS.TOGGLE_NOTIFICATION, ToggleNotificationCommand);

bot.on("text", (ctx) => {
  const command = ctx.session.command;
  if (command === COMMANDS.ADD) {
    AddBookmarksFollowup(ctx);
  }
  if (command === COMMANDS.REMOVE) {
    RemoveBookmarksFollowup(ctx);
  }
  if (command === COMMANDS.FEEDBACK) {
    FeedbackFollowup(ctx);
  }
  if (command === COMMANDS.ADD_COMPLETED) {
    AddCompletedFollowup(ctx);
  }
  if (command === COMMANDS.REMOVE_COMPLETED) {
    RemoveCompletedFollowup(ctx);
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
bot.on("callback_query", async (ctx: any) => {
  const data = ctx.callbackQuery.data;

  await ctx.answerCbQuery();

  if (ctx.session.add.step === STEP.SOURCE) {
    ctx.session.add.source = data;
    ctx.session.add.step = STEP.URL;
    let response;
    if (data === SOURCE.MANGADEX) {
      response = BOOKMARK_ADD_MANGADEX;
    } else if (data === SOURCE.COMICK) {
      response = BOOKMARK_ADD_COMICK;
    } else if (data === SOURCE.MANHUAUS) {
      response = BOOKMARK_ADD_MANHUAUS;
    } else if (data === SOURCE.MANHUAPLUS) {
      response = BOOKMARK_ADD_MANHUAPLUS;
    } else if (data === SOURCE.HARIMANGA) {
      response = BOOKMARK_ADD_HARIMANGA;
    } else if (data === SOURCE.WEBTOONS) {
      response = BOOKMARK_ADD_WEBTOONS;
    } else if (data === SOURCE.XBATO) {
      response = BOOKMARK_ADD_XBATO;
    } else {
      response = BOOKMARK_ADD_ASK_URL_WITH_CHAPTER;
    }
    await ctx.reply(response);
  }
});

bot.telegram.setMyCommands(CommandList);

const PORT = 3000;
const WEBHOOK_DOMAIN = ENVIRONMENT.WEBHOOK_DOMAIN;

const args = process.argv;

if (args[args.length - 1] === "--local") {
  bot.launch();
  console.log("Bot started locally");

  app.listen(PORT + 1, () => {
    console.log(`Server is running on port ${PORT + 1}`);
  });
} else {
  bot
    .launch({ webhook: { domain: WEBHOOK_DOMAIN, port: PORT } })
    .then(() => console.log("Webhook bot listening on port", PORT));
  initCronJob(bot);
  initStayAlive();
}
