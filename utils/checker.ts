export const checkIfUrlExist = async (url: string, chapter: number) => {
  try {
    const response = await fetch(url);
    if (response.status === 404) return false;

    const data = await response.text();
    const _data = data.toLowerCase();
    if (url.includes("tenseislime")) {
      console.log(_data);
    }
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
    return false;
  }
};

export const checkIfUrlExistWLogs = async (url: string, chapter: number) => {
  try {
    const response = await fetch(url);
    if (response.status === 404) return "404";

    const data = await response.text();
    const _data = data.toLowerCase();
    if (_data.includes("not found")) return "not found";
    if (_data.includes("Oops! That page can’t be found"))
      return "Oops! That page can’t be found";
    if (_data.includes("not available")) return "not available";
    if (_data.includes("coming soon")) return "coming soon";
    if (_data.includes("stay tuned")) return "stay tuned";
    if (_data.includes("Please don’t wait for the Official website"))
      // For https://readchainsaw-man.com/
      return "Please don’t wait for the Official website";
    if (_data.replace(/\s+/g, "").includes("comingsoon")) return "comingsoon";
    if (!_data.includes(`chapter ${chapter}`))
      return `Term Chapter ${chapter} not found`;

    return "";
  } catch (error) {
    console.log("Checking Url Error", error);
    return "Error";
  }
};
