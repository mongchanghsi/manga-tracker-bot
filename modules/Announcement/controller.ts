import { Request, Response } from "express";
import {
  sendAnnouncement,
  testAnnouncement,
  sendDirectMessage,
} from "./service";

export const announce = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { message } = req.body;

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
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    await testAnnouncement(message);
    return res.status(200).json({ success: "Announcement sent" });
  } catch (error: unknown) {
    console.log(error);
    return res.status(500).json({ error: "Failed to send announcement." });
  }
};

export const sendMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { telegramIds, message } = req.body;

  if (telegramIds.length === 0) {
    return res.status(400).json({ error: "Missing telegram Ids" });
  }

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    await sendDirectMessage(telegramIds, message);
    return res.status(200).json({ success: "Messages sent" });
  } catch (error: unknown) {
    console.log(error);
    return res.status(500).json({ error: "Failed to send announcement." });
  }
};
