type INLINE_COMMAND = {
  text: string;
  callback_data: string;
};

export type INLINE_KEYBOARD = INLINE_COMMAND[][];

export type Bookmark = {
  id: number;
  name: string;
  latestChapter: number;
  url: string;
  source: SOURCE;
};

export enum SOURCE {
  MANGADEX = "MangaDEX",
  COMICK = "Comick.io",
  MANHUAUS = "Manhuaus",
  MANHUAPLUS = "ManhuaPlus",
  HARIMANGA = "Harimanga",
  WEBTOONS = "Webtoons",
  XBATO = "xBato",
  COMICK_LIVE = "Comick.live",
  OTHERS = "Others",
}

export type User = {
  id: number;
  telegramId: number;
  is_on: boolean;
};
