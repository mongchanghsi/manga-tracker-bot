import { Context, NarrowedContext } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";

export const getChatId = (
  ctx: NarrowedContext<Context, MountMap["text"]>
): number => ctx.message.chat.id;
export const getUsername = (
  ctx: NarrowedContext<Context, MountMap["text"]>
): string => ctx.update.message.from.username ?? "";
export const getFirstName = (
  ctx: NarrowedContext<Context, MountMap["text"]>
): string => ctx.update.message.from.first_name ?? "";
