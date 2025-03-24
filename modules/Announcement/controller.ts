import { Request, Response } from "express";
import { sendAnnouncement, testAnnouncement } from "./service";
import ENVIRONMENT from "../../configuration/environment";

export const announce = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { message, seed } = req.body;

  if (seed !== ENVIRONMENT.SECRET_SEED) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    await sendAnnouncement(message);
    return res.status(200).json({ success: "Announcement sent to all users." });
  } catch (error: unknown) {
    console.log(error);
    return res.status(500).json({ error: "Failed to send announcement." });
  }
};

export const testAnnounce = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { message, seed } = req.body;

  if (seed !== ENVIRONMENT.SECRET_SEED) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    await testAnnouncement(message);
    return res.status(200).json({ success: "Announcement sent to all users." });
  } catch (error: unknown) {
    console.log(error);
    return res.status(500).json({ error: "Failed to send announcement." });
  }
};
