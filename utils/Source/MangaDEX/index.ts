import BaseSource from "..";
import { PrepareRealisticHeaders } from "../../realisticFetch";
import { MangaDEXResponse } from "./types";

class MangaDEXSource extends BaseSource {
  private ExtractIDFromUrl(url: string) {
    const match = url.match(/title\/([a-f0-9-]+)/i);

    if (match && match[1]) {
      const id = match[1];
      return id;
    }
    return "";
  }

  isValidUrl(url: string) {
    return url.includes("https://mangadex.org/title");
  }

  async getLatestChapter(url: string) {
    const id = this.ExtractIDFromUrl(url);
    const mangaUrl = `https://api.mangadex.org/manga/${id}/feed?translatedLanguage[]=en&order[updatedAt]=desc&limit=1`;

    try {
      const response = await fetch(mangaUrl, {
        headers: {
          ...PrepareRealisticHeaders(),
        },
      });
      const responseBody: MangaDEXResponse = await response.json();
      if (responseBody.result !== "ok" || responseBody.data?.length === 0)
        return {
          chapter: 0,
          viewer: "",
          errors: [],
        };

      const mangaDetails = responseBody.data[0];
      return {
        chapter: +mangaDetails.attributes.chapter,
        viewer: mangaDetails.attributes.externalUrl,
        errors: [],
      };
    } catch (error) {
      console.log("MangaDEX | getLatestChapter | Error - ", error);
      return {
        chapter: 0,
        viewer: "",
        errors: [],
      };
    }
  }
}

export default MangaDEXSource;
