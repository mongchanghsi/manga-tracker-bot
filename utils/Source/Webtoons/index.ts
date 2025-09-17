import BaseSource from "..";
import { PrepareRealisticHeaders } from "../../realisticFetch";
import { JSDOM, VirtualConsole } from "jsdom";

type ValidationRule = {
  name: string;
  validate: (input: string) => boolean;
  errorMessage: string;
};

const makeRule = (
  name: string,
  test: (input: string) => boolean,
  message?: string
): ValidationRule => {
  return {
    name,
    validate: test,
    errorMessage: message ?? `${name} rule failed.`,
  };
};

const getRules = (chapter: number): ValidationRule[] => [
  makeRule(
    "chapterPresent",
    (input) => input.includes(`episode ${chapter}`),
    `Missing "episode ${chapter}".`
  ),
];

class WebtoonsSource extends BaseSource {
  isValidUrl(url: string) {
    return (
      url.includes("https://www.m.webtoons.com/en") ||
      url.includes("https://www.webtoons.com/en")
    );
  }

  async getLatestChapter(url: string, chapter: number) {
    const rules = getRules(chapter);

    try {
      const response = await fetch(url, {
        headers: {
          ...PrepareRealisticHeaders(),
        },
      });

      if (!response.ok)
        return {
          chapter: 0,
          viewer: url,
          errors: [response.status.toString()],
        };

      const data = await response.text();
      const virtualConsole = new VirtualConsole();
      virtualConsole.on("error", () => {});
      const dom = new JSDOM(data, { virtualConsole });
      const document = dom.window.document;

      return {
        chapter,
        viewer: url,
        errors: rules
          .filter((rule) => !rule.validate(document.title.toLowerCase()))
          .map((rule) => rule.errorMessage),
      };
    } catch (error) {
      console.log("WebtoonsSource | getLatestChapter | Error - ", error);
      return {
        chapter: 0,
        viewer: url,
        errors: [],
      };
    }
  }
}

export default WebtoonsSource;
