import { NarrowedContext, Types } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { getMessage, getUserId } from "../../utils/telegramHelper";
import userDb from "../../database/User";
import { COMMANDS } from "../../utils/command";
import listDb from "../../database/List";
import { BookmarkSessionContext, DEFAULT_ADD_SESSION, STEP } from "./session";
import { Message, Update } from "telegraf/types";
import {
  BOOKMARK_ADD_ASK_NAME,
  BOOKMARK_ADD_ASK_SOURCE,
  BOOKMARK_ADD_ASK_CHAPTER,
  BOOKMARK_ADD_SUCCESS,
  NOT_REGISTERED,
  SERVICE_PAUSED,
} from "../../utils/messages";
import ENVIRONMENT from "../../configuration/environment";
import { SOURCE } from "../../utils/types";
import { CheckOnly } from "../../utils/checkAndSend";

export const AddBookmarksCommand = async (
  ctx: NarrowedContext<BookmarkSessionContext, MountMap["text"]>
) => {
  if (ENVIRONMENT.PAUSE_SERVICE) return await ctx.reply(SERVICE_PAUSED);

  const userId = getUserId(ctx);
  const user = await userDb.getUser(userId);
  if (!user) return await ctx.reply(NOT_REGISTERED);

  ctx.session.command = COMMANDS.ADD;
  ctx.session.add.step = STEP.NAME;
  await ctx.reply(BOOKMARK_ADD_ASK_NAME);
};

export const AddBookmarksAction = async (
  ctx: NarrowedContext<
    BookmarkSessionContext<Update>,
    Types.MountMap["callback_query"]
  >
) => {
  if (ENVIRONMENT.PAUSE_SERVICE) {
    return await ctx.reply(SERVICE_PAUSED);
  }

  ctx.session.command = COMMANDS.ADD;
  ctx.session.add.step = STEP.NAME;
  await ctx.reply(BOOKMARK_ADD_ASK_NAME);
  ctx.answerCbQuery();
};

export const AddBookmarksFollowup = async (
  ctx: NarrowedContext<
    BookmarkSessionContext<Update>,
    {
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }
  >
) => {
  const params = ctx.session.add;

  if (params.step === STEP.NAME) {
    // User replied name, now ask for source
    params.name = getMessage(ctx);
    params.step = STEP.SOURCE;
    await ctx.replyWithHTML(BOOKMARK_ADD_ASK_SOURCE, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: SOURCE.MANGADEX, callback_data: SOURCE.MANGADEX },
            { text: SOURCE.WEBTOONS, callback_data: SOURCE.WEBTOONS },
          ],
          [
            { text: SOURCE.MANHUAUS, callback_data: SOURCE.MANHUAUS },
            { text: SOURCE.MANHUAPLUS, callback_data: SOURCE.MANHUAPLUS },
          ],
          [
            { text: SOURCE.HARIMANGA, callback_data: SOURCE.HARIMANGA },
            { text: SOURCE.XBATO, callback_data: SOURCE.XBATO },
          ],
          [{ text: SOURCE.OTHERS, callback_data: SOURCE.OTHERS }],
        ],
      },
    });
    // source step is in the index.ts
  } else if (params.step === STEP.URL) {
    params.url = getMessage(ctx);
    if (
      [
        SOURCE.OTHERS,
        SOURCE.MANHUAUS,
        SOURCE.MANHUAPLUS,
        SOURCE.HARIMANGA,
        SOURCE.WEBTOONS,
      ].includes(params.source as SOURCE)
    ) {
      params.step = STEP.CHAPTER;
      await ctx.reply(BOOKMARK_ADD_ASK_CHAPTER);
    } else {
      const chapterDetails = await CheckOnly({
        id: 0,
        name: params.name,
        latestChapter: 0,
        url: params.url,
        source: params.source as SOURCE,
      });
      await listDb.addBookmark(
        getUserId(ctx),
        params.name,
        params.url,
        (chapterDetails?.chapter || 0).toString(),
        params.source
      );
      await ctx.reply(BOOKMARK_ADD_SUCCESS);
      ctx.session.command = COMMANDS.START;
      ctx.session.add = DEFAULT_ADD_SESSION;
    }
  } else if (params.step === STEP.CHAPTER) {
    params.latestChapter = getMessage(ctx);
    await listDb.addBookmark(
      getUserId(ctx),
      params.name,
      params.url,
      params.latestChapter,
      params.source
    );
    await ctx.reply(BOOKMARK_ADD_SUCCESS);
    ctx.session.command = COMMANDS.START;
    ctx.session.add = DEFAULT_ADD_SESSION;
  }
};
