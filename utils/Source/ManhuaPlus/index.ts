import puppeteer from "puppeteer-core";
import BaseSource from "..";
import { JSDOM, VirtualConsole } from "jsdom";
import ENVIRONMENT from "../../../configuration/environment";

const BROWSERLESS_WS = `wss://production-sfo.browserless.io?token=${ENVIRONMENT.BROWERLESS_TOKEN}`;

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
    (input) => input.includes(`chapter ${chapter}`),
    `Missing "chapter ${chapter}".`
  ),
];

class ManhuaPlusSource extends BaseSource {
  isValidUrl(url: string) {
    return url.includes("https://manhuaplus.org/manga");
  }

  async getLatestChapter(url: string, chapter: number) {
    let browser;
    let page;

    // Later consider whether the url is inclusive of the chapter-placeholder
    const rules = getRules(chapter);

    try {
      browser = await puppeteer.connect({
        browserWSEndpoint: BROWSERLESS_WS,
      });
      page = await browser.newPage();

      await page.setUserAgent(
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0"
      );

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 15_000, // 15 seconds timeout
      });

      const content = await page.content();

      const virtualConsole = new VirtualConsole();
      virtualConsole.on("error", () => {});

      const dom = new JSDOM(content, { virtualConsole });
      const document = dom.window.document;

      return {
        chapter,
        viewer: url,
        errors: rules
          .filter((rule) => !rule.validate(document.title.toLowerCase()))
          .map((rule) => rule.errorMessage),
      };
    } catch (error) {
      console.log("ManhuaPlusSource | getLatestChapter | Error - ", error);
      return {
        chapter: 0,
        viewer: url,
        errors: [],
      };
    } finally {
      if (page) await page.close();
      if (browser) await browser.disconnect();
    }
  }
}

export default ManhuaPlusSource;
