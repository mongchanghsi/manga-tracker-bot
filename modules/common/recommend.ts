import { Context, NarrowedContext } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";

const responseMessage = `No idea what to read?\n\nHere's the Owner's Recommendation!\n\n1. Solo Max Level Newbie\n2.Eleceed\n3. Tomb Raider King\n4. Solo Leveling\n5. Shangri-La Frontier`;

export const RecommendCommand = async (
  ctx: NarrowedContext<Context, MountMap["text"]>
) => {
  ctx.reply(responseMessage);
};
