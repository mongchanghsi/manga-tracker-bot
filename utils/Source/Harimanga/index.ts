import puppeteer from "puppeteer-extra";
import BaseSource from "..";
import { JSDOM, VirtualConsole } from "jsdom";
import ENVIRONMENT from "../../../configuration/environment";
import { PrepareRealisticHeaders } from "../../realisticFetch";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

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

class HarimangaSource extends BaseSource {
  isValidUrl(url: string) {
    return url.includes("https://harimanga.me/manga");
  }

  async getLatestChapter(url: string, chapter: number) {
    let browser;
    let page;

    // Later consider whether the url is inclusive of the chapter-placeholder
    const rules = getRules(chapter);
    const header = PrepareRealisticHeaders();

    try {
      puppeteer.use(StealthPlugin());
      browser = await puppeteer.connect({
        browserWSEndpoint: BROWSERLESS_WS,
      });
      page = await browser.newPage();

      await page.setUserAgent(header["User-Agent"]);
      const extraHeaders = { ...header };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (extraHeaders as any)["User-Agent"];
      await page.setExtraHTTPHeaders(extraHeaders);

      await page.goto(url, {
        waitUntil: "domcontentloaded",
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
      console.log("HarimangaSource | getLatestChapter | Error - ", error);
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

export default HarimangaSource;
