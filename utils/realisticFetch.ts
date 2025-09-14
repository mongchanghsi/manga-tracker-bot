const userAgents = [
  {
    ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    secChUa:
      '"Chromium";v="115", "Google Chrome";v="115", "Not:A-Brand";v="99"',
    platform: '"Linux"',
  },
  {
    ua: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0",
    secChUa: '"Firefox";v="102", "Not:A-Brand";v="99"',
    platform: '"Linux"',
  },
  {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    secChUa:
      '"Chromium";v="115", "Google Chrome";v="115", "Not:A-Brand";v="99"',
    platform: '"Windows"',
  },
  {
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
    secChUa: '"Safari";v="15", "Not:A-Brand";v="99"',
    platform: '"macOS"',
  },
];

export const PrepareRealisticHeaders = () => {
  const getRandomUserAgent = () =>
    userAgents[Math.floor(Math.random() * userAgents.length)];

  return {
    "User-Agent": getRandomUserAgent().ua,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
    "Sec-CH-UA": getRandomUserAgent().secChUa,
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": getRandomUserAgent().platform,
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    // Referer: "https://www.mangakakalot.gg/manga/mercenary-enrollment",
    // "If-Modified-Since": "Thu, 31 Jul 2025 00:07:42 GMT",
  };
};
