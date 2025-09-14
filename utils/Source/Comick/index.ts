import puppeteer from "puppeteer-core";
import BaseSource from "..";
import { JSDOM, VirtualConsole } from "jsdom";
import { ComickPropsResponse } from "./types";
import ENVIRONMENT from "../../../configuration/environment";

const BROWSERLESS_WS = `wss://chrome.browserless.io?token=${ENVIRONMENT.BROWERLESS_TOKEN}`;

class ComickSource extends BaseSource {
  isValidUrl(url: string) {
    return url.includes("https://comick.io/comic");
  }

  async getLatestChapter(url: string) {
    let browser;
    let page;

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

      const scriptTag = document.getElementById("__NEXT_DATA__");

      if (scriptTag) {
        const jsonString = scriptTag.textContent;
        try {
          const jsonData: ComickPropsResponse = JSON.parse(jsonString || "");
          // TODO: Figure out how to get the URL
          return {
            chapter: +jsonData.props.pageProps.comic.last_chapter,
            viewer: url,
            errors: [],
          };
        } catch (error) {
          console.log("ComickSource | getLatestChapter | Error - ", error);
        }
      } else {
        console.log(
          "ComickSource | getLatestChapter | Error - Script tag with id '__NEXT_DATA__' not found."
        );
      }

      return {
        chapter: 0,
        viewer: "",
        errors: [],
      };
    } catch (error) {
      console.log("ComickSource | getLatestChapter | Error - ", error);
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

export default ComickSource;
