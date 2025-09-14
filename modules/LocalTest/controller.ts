import { Request, Response } from "express";
import { fetchComickDetails, fetchMangaDEXDetails } from "./service";

export const testMangaDex = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    await fetchMangaDEXDetails(url as string);
    return res.status(200).json({ success: "Test ok" });
  } catch (error: unknown) {
    console.log(error);
    return res.status(500).json({ error: "Test fail" });
  }
};

export const testComick = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    await fetchComickDetails(url as string);
    return res.status(200).json({ success: "Test ok" });
  } catch (error: unknown) {
    console.log(error);
    return res.status(500).json({ error: "Test fail" });
  }
};
