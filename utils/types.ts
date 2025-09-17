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
  WEBTOONS = "Webtoons",
  OTHERS = "Others",
}

export type User = {
  id: number;
  telegramId: number;
  is_on: boolean;
};
