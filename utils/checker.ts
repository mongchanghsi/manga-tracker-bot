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

    return true;
  } catch (error) {
    console.log("Checking Url Error", error);
    return false;
  }
};
