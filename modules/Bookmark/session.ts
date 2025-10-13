import { Context } from "telegraf";
import { Update } from "telegraf/types";
import { COMMANDS } from "../../utils/command";
// import { Update } from 'telegraf/typings/core/types/typegram';

export interface BookmarkSessionContext<U extends Update = Update>
  extends Context<U> {
  session: {
    command: COMMANDS;
    add: ADD_SESSION;
  };
}

export type ADD_SESSION = {
  step: string;
  name: string;
  url: string;
  latestChapter: string;
  source: string;
};

export enum STEP {
  NAME = "name",
  SOURCE = "source",
  URL = "url",
  CHAPTER = "chapter",
}

export const DEFAULT_ADD_SESSION = {
  step: STEP.NAME,
  name: "",
  url: "",
  latestChapter: "",
  source: "",
};
