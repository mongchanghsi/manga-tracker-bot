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
};
