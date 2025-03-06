type INLINE_COMMAND = {
  text: string;
  callback_data: string;
};

export type INLINE_KEYBOARD = INLINE_COMMAND[][];
