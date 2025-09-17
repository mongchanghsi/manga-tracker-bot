import { Telegraf } from "telegraf";
import { BookmarkSessionContext } from "../modules/Bookmark/session";
import ComickSource from "./Source/Comick";
import MangaDEXSource from "./Source/MangaDEX";
import OthersSource from "./Source/Others";
import { Bookmark, SOURCE, User } from "./types";
import { Update } from "telegraf/types";
import listDb from "../database/List";
import ManhuausSource from "./Source/Manhuaus";
import ManhuaPlusSource from "./Source/ManhuaPlus";
import WebtoonsSource from "./Source/Webtoons";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const DELAY = 1_000;

export const CheckOnly = async (bookmark: Bookmark) => {
  let nextChapterDetails: {
    chapter: number;
    viewer: string;
    errors: string[];
  } = {
    chapter: 0,
    viewer: "",
    errors: [],
  };

  console.log(
    "Checking - ",
    bookmark.name,
    " | ",
    bookmark.url.replaceAll(
      bookmark.latestChapter.toString(),
      (bookmark.latestChapter + 1).toString()
    )
  );

  switch (bookmark.source) {
    case SOURCE.MANGADEX: {
      const source = new MangaDEXSource();
      nextChapterDetails = await source.getLatestChapter(bookmark.url);
      break;
    }
    case SOURCE.COMICK: {
      const source = new ComickSource();
      nextChapterDetails = await source.getLatestChapter(bookmark.url);
      break;
    }
    default: {
      let source;
      switch (bookmark.source) {
        case SOURCE.MANHUAUS: {
          source = new ManhuausSource();
          break;
        }
        case SOURCE.MANHUAPLUS: {
          source = new ManhuaPlusSource();
          break;
        }
        case SOURCE.WEBTOONS: {
          source = new WebtoonsSource();
          break;
        }
        default:
          source = new OthersSource();
      }

      if (
        bookmark.latestChapter === null ||
        bookmark.url === null ||
        bookmark.url.length === 0 ||
        !source.isValidUrl(bookmark.url)
      ) {
        break;
      }

      nextChapterDetails = await source.getLatestChapter(
        bookmark.url.replaceAll(
          bookmark.latestChapter.toString(),
          (bookmark.latestChapter + 1).toString()
        ),
        bookmark.latestChapter + 1
      );
    }
  }

  // Specifically for Others Source
  const { errors } = nextChapterDetails;
  if (errors.length > 0) {
    console.log("Errors - ", errors);
    if (errors.includes("500")) {
      // TODO: Later change the bookmark url
      console.log(
        "🔴 There is an issue with this URL ",
        `- ${nextChapterDetails.viewer}`
      );
    }

    console.log("🔴 - ", nextChapterDetails.viewer);
  }
  return {
    ...nextChapterDetails,
    name: bookmark.name,
  };
};

export const CheckAndUpdate = async (bookmark: Bookmark) => {
  const nextChapterDetails = await CheckOnly(bookmark);
  if (
    nextChapterDetails.chapter > bookmark.latestChapter &&
    nextChapterDetails.errors.length === 0
  ) {
    await listDb.updateBookmark(bookmark.id, bookmark.latestChapter + 1);
    console.log("🟢 - ", nextChapterDetails.viewer);
    return nextChapterDetails;
  }
  return false;
};

export const CheckMultiAndUpdate = async (bookmarks: Bookmark[]) => {
  for (const _bookmark of bookmarks) {
    await delay(DELAY);
    await CheckAndUpdate(_bookmark);
  }
};

export const CheckAndUpdateAndSend = async (
  bot: Telegraf<BookmarkSessionContext<Update>>,
  user: User,
  bookmark: Bookmark
) => {
  const nextChapterDetails = await CheckAndUpdate(bookmark);
  if (!!nextChapterDetails && user.is_on) {
    bot.telegram.sendMessage(
      user.telegramId,
      `${nextChapterDetails.name} has just released a new chapter - ${nextChapterDetails.chapter}! ${nextChapterDetails.viewer}`,
      {
        link_preview_options: {
          is_disabled: true,
        },
      }
    );
  }
};

export const CheckMultiAndUpdateAndSend = async (
  bot: Telegraf<BookmarkSessionContext<Update>>,
  user: User,
  bookmarks: Bookmark[]
) => {
  for (const _bookmark of bookmarks) {
    await delay(DELAY);
    await CheckAndUpdateAndSend(bot, user, _bookmark);
  }
};
