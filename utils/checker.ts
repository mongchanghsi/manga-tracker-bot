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

    return true;
  } catch (error) {
    console.log("Checking Url Error", error);
  }
};
