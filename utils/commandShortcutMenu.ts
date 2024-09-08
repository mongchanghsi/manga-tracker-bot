import { BotCommand } from "telegraf/typings/core/types/typegram";
import { COMMANDS } from "./command";

const CommandList: BotCommand[] = [
  {
    command: COMMANDS.START,
    description: "Start the bot",
  },
  {
    command: COMMANDS.HELP,
    description: "View the list of help commands",
  },
];

export default CommandList;
