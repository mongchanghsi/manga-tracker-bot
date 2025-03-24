import { Telegraf } from "telegraf";
import { BookmarkSessionContext } from "../Bookmark/session";
import ENVIRONMENT from "../../configuration/environment";

const bot = new Telegraf<BookmarkSessionContext>(ENVIRONMENT.BOT_TOKEN);

export default bot;
