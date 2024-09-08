import { Context, NarrowedContext, Types } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
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
export const getUserId = (
  ctx: NarrowedContext<Context, MountMap["text"]>
): number => ctx.update.message.from.id ?? 0;
export const getUserIdFromCallback = (
  ctx: NarrowedContext<Context<Update>, Types.MountMap["callback_query"]>
): number => ctx.update.callback_query.from.id ?? 0;
export const getMessage = (
  ctx: NarrowedContext<Context, MountMap["text"]>
): string => ctx.update.message.text;
