import { BotCommand } from "telegraf/typings/core/types/typegram";
import { COMMANDS } from "./command";

const CommandList: BotCommand[] = [
  {
    command: COMMANDS.START,
    description: "Start the bot",
  },
  {
    command: COMMANDS.LIST,
    description: "Get current bookmarked list",
  },
  {
    command: COMMANDS.ADD,
    description: "Bookmark a manga",
  },
  {
    command: COMMANDS.REMOVE,
    description: "Remove a bookmarked manga",
  },
  {
    command: COMMANDS.FEEDBACK,
    description: "Give a feedback",
  },
  {
    command: COMMANDS.HELP,
    description: "View the list of help commands",
  },
];

export default CommandList;
