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
    "notFound",
    (input) => !input.includes("not found"),
    `"not found" found in data.`
  ),
  makeRule(
    "oopsPage",
    (input) => !input.includes("Oops! That page can’t be found"),
    `"Oops!..." found.`
  ),
  makeRule(
    "notAvailable",
    (input) => !input.includes("not available"),
    `"not available" found.`
  ),
  makeRule(
    "comingSoon",
    (input) => !input.includes("coming soon"),
    `"coming soon" found.`
  ),
  makeRule(
    "stayTuned",
    (input) => !input.includes("stay tuned"),
    `"stay tuned" found.`
  ),
  makeRule(
    "comingSoonNoSpace",
    (input) => !input.replace(/\s+/g, "").includes("comingsoon"),
    `"comingsoon" (no spaces) found.`
  ),
  makeRule(
    "chapterPresent",
    (input) => input.includes(`chapter ${chapter}`),
    `Missing "chapter ${chapter}".`
  ),
  makeRule(
    "releaseCountdown",
    (input) => !input.includes("a few moments separate us from the release of"),
    `Countdown text found.`
  ),
  makeRule(
    "officialWait",
    (input) => !input.includes("Don’t wait for the official website"),
    `Official wait message found.`
  ),
  makeRule(
    "placeholder",
    (input) => !input.includes("This is a placeholder"),
    `Placeholder detected.`
  ),
  makeRule(
    "infoNbsp",
    (input) => !input.includes("Info &nbsp"),
    `Info &nbsp found.`
  ),
  makeRule(
    "newChapterSoon",
    (input) => !input.includes("The new chapter will be available soon"),
    `Future chapter placeholder found.`
  ),
  makeRule(
    "countdown",
    (input) => !input.includes("countdown"),
    `"countdown" found.`
  ),
];

class OthersSource extends BaseSource {
  isValidUrl(url: string) {
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s]*)?$/;
    return regex.test(url);
  }

  async getLatestChapter(url: string, chapter: number) {
    // Later consider whether the url is inclusive of the chapter-placeholder
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

      // Remove head tag - sometimes meta tag contain alot of useless information causing problem with validator
      const virtualConsole = new VirtualConsole();
      virtualConsole.on("error", () => {}); // suppress stylesheet parse errors
      const dom = new JSDOM(data, { virtualConsole });
      const document = dom.window.document;
      const head = document.querySelector("head");
      if (head) head.remove();
      document.querySelectorAll("style, link").forEach((el) => el.remove());
      const cleanedHTML = dom.serialize();

      const _data = cleanedHTML.toLowerCase();

      return {
        chapter,
        viewer: url,
        errors: rules
          .filter((rule) => !rule.validate(_data))
          .map((rule) => rule.errorMessage),
      };
    } catch (error) {
      console.log("Others | getLatestChapter | Error - ", error);
      return {
        chapter: 0,
        viewer: url,
        errors: [],
      };
    }
  }
}

export default OthersSource;
