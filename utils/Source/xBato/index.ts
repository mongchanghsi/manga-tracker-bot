import BaseSource from "..";
import { PrepareRealisticHeaders } from "../../realisticFetch";

type HanifuChapter = {
  name: string;
  chapter: string;
  url: string;
  url_detail: string;
  published_at: string;
};

type HanifuResponse = {
  data: {
    chapters: HanifuChapter[];
  };
};

class xBatoSource extends BaseSource {
  isValidUrl(url: string) {
    return url.includes("https://xbato.com/title");
  }

  toBase64(url: string) {
    return Buffer.from(url, "utf-8").toString("base64");
  }

  removeVolumeInfo(str: string) {
    return str.replace(/Volume\s*\d+\s*/gi, "").trim();
  }

  async getLatestChapter(url: string) {
    try {
      const base64 = this.toBase64(url);
      const response = await fetch(
        `https://xbato-api.hanifu.id/comic/${base64}`,
        {
          headers: {
            ...PrepareRealisticHeaders(),
          },
        }
      );

      if (!response.ok)
        return {
          chapter: 0,
          viewer: url,
          errors: [response.status.toString()],
        };

      const data: HanifuResponse = await response.json();
      const chapters = data.data.chapters;
      const latestChapterInfo = chapters[chapters.length - 1];
      const latestChapter = this.removeVolumeInfo(
        latestChapterInfo.chapter
      ).split(" ")[1];

      return { chapter: +latestChapter, viewer: url, errors: [] };
    } catch (error) {
      console.log("xBato | getLatestChapter | Error - ", error);
      return { chapter: 0, viewer: url, errors: [] };
    }
  }
}

export default xBatoSource;
