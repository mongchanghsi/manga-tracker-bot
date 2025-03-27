import { COMMANDS } from "../../utils/command";
import { INLINE_KEYBOARD } from "../../utils/types";

export const DEFAULT_GET_INLINE_KEYBOARD_COMMANDS: INLINE_KEYBOARD = [
  [
    { text: "Add ➕", callback_data: COMMANDS.ADD },
    { text: "Remove ❌", callback_data: COMMANDS.REMOVE },
  ],
  [
    {
      text: "Refresh 🔄",
      callback_data: `${COMMANDS.REFRESH}`,
    },
  ],
];
