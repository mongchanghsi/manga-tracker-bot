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
    "readChainsaw",
    (input) => !input.includes("Please don’t wait for the Official website"),
    `Placeholder found (Chainsaw Man).`
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

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0",
  "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.65 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
];

export const checkIfUrlExistV2 = async (url: string, chapter: number) => {
  try {
    const rules = getRules(chapter);
    const getRandomUserAgent = () =>
      userAgents[Math.floor(Math.random() * userAgents.length)];
    const response = await fetch(url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });
    if (!response.ok) return [`Site faced with ${response.status}`];

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

    return rules
      .filter((rule) => !rule.validate(_data))
      .map((rule) => rule.errorMessage);
  } catch (error) {
    console.log("Checking Url Error", error);
    return 500;
  }
};

export const checkIfUrlExist = async (url: string, chapter: number) => {
  try {
    const response = await fetch(url);
    if (response.status === 404) return false;

    const data = await response.text();
    const _data = data.toLowerCase();

    if (_data.includes("not found")) return false;
    if (_data.includes("Oops! That page can’t be found")) return false;
    if (_data.includes("not available")) return false;
    if (_data.includes("coming soon")) return false;
    if (_data.includes("stay tuned")) return false;
    if (_data.includes("Please don’t wait for the Official website"))
      // For https://readchainsaw-man.com/
      return false;
    if (_data.replace(/\s+/g, "").includes("comingsoon")) return false;
    if (!_data.includes(`chapter ${chapter}`)) return false;
    if (_data.includes("a few moments separate us from the release of"))
      // For https://w15.reincarnationofsuicidalbattlegod.com/
      return false;
    if (_data.includes("Don’t wait for the official website"))
      // For https://extrasacademysurvivalguide.online/
      return false;
    if (_data.includes("This is a placeholder")) return false;
    if (_data.includes("Info &nbsp")) return false; // For https://thereincarnatedassassinisageniusswordsman.us/
    if (_data.includes("The new chapter will be available soon")) return false; // https://theregressedsonofadukeisanassassin.club/
    if (_data.includes("countdown")) return false;

    return true;
  } catch (error) {
    console.log("Checking Url Error", error);
    return 500;
  }
};

export const isValidUrl = (url: string) => {
  const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s]*)?$/;
  return regex.test(url);
};
