import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import BaseSource from "..";
import { JSDOM, VirtualConsole } from "jsdom";
import ENVIRONMENT from "../../../configuration/environment";
import { PrepareRealisticHeaders } from "../../realisticFetch";
import { ComickLiveDataResponse } from "./types";

const BROWSERLESS_WS = `wss://production-sfo.browserless.io?token=${ENVIRONMENT.BROWERLESS_TOKEN}`;

class ComickLiveSource extends BaseSource {
  isValidUrl(url: string) {
    return url.includes("https://comick.live/comic");
  }

  async getLatestChapter(url: string) {
    let browser;
    let page;

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
        waitUntil: "networkidle2",
        timeout: 15_000, // 15 seconds timeout
      });

      const content = await page.content();

      const virtualConsole = new VirtualConsole();
      virtualConsole.on("error", () => {});

      const dom = new JSDOM(content, { virtualConsole });
      const document = dom.window.document;

      const scriptTag = document.getElementById("comic-data");

      if (scriptTag) {
        const jsonString = scriptTag.textContent;
        try {
          const jsonData: ComickLiveDataResponse = JSON.parse(jsonString || "");
          // TODO: Figure out how to get the URL
          return {
            chapter: +jsonData.last_chapter,
            viewer: url,
            errors: [],
          };
        } catch (error) {
          console.log("ComickLiveSource | getLatestChapter | Error - ", error);
        }
      } else {
        console.log(
          "ComickLiveSource | getLatestChapter | Error - Script tag with id 'comic-data' not found."
        );
      }

      return {
        chapter: 0,
        viewer: "",
        errors: [],
      };
    } catch (error) {
      console.log("ComickLiveSource | getLatestChapter | Error - ", error);
      return {
        chapter: 0,
        viewer: "",
        errors: [],
      };
    } finally {
      if (page) await page.close();
      if (browser) await browser.disconnect();
    }
  }
}

export default ComickLiveSource;
