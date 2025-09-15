import ComickSource from "../../utils/Source/Comick";
import MangaDEXSource from "../../utils/Source/MangaDEX";
import OthersSource from "../../utils/Source/Others";

export const fetchMangaDEXDetails = async (url: string) => {
  try {
    const source = new MangaDEXSource();
    const response = await source.getLatestChapter(url);
    console.log(response);
  } catch (error) {
    console.log("Error sending announcement:", error);
  }
};

export const fetchComickDetails = async (url: string) => {
  try {
    const source = new ComickSource();
    const response = await source.getLatestChapter(url);
    console.log(response);
  } catch (error) {
    console.log("Error sending announcement:", error);
  }
};

export const fetchOtherDetails = async (url: string, chapter: number) => {
  try {
    const source = new OthersSource();
    const response = await source.getLatestChapter(url, chapter);
    console.log(response);
  } catch (error) {
    console.log("Error sending announcement:", error);
  }
};
