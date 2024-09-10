export const checkIfUrlExist = async (url: string) => {
  try {
    const response = await fetch(url);
    if (response.status === 404) return false;

    const data = await response.text();
    if (data.toLowerCase().includes("not found")) return false;
    if (data.toLowerCase().includes("Oops! That page can’t be found"))
      return false;
    if (data.toLowerCase().includes("not available")) return false;
    if (!data.toLowerCase().includes(`Manga Info`)) return false;

    return true;
  } catch (error) {
    console.log("Checking Url Error", error);
  }
};
