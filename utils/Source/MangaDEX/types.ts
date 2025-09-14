export type MangaDEXResponse = {
  result: string;
  response: string;
  data: MangaDEXDataResponse[];
  limit: number;
  offset: number;
  total: number;
};

export type MangaDEXDataResponse = {
  id: string;
  type: string;
  attributes: {
    volume: null;
    chapter: string;
    title: string;
    translatedLanguage: string;
    externalUrl: string;
    isUnavailable: false;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    version: number;
    pages: number;
  };
};
