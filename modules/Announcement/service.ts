import ENVIRONMENT from "../../configuration/environment";
import userDb from "../../database/User";
import bot from "../common/init-bot";

export const sendAnnouncement = async (message: string) => {
  try {
    const users = await userDb.getAllUser();
    const userIds = users.map((_user) => _user.telegramId);

    for (const userId of userIds) {
      await bot.telegram.sendMessage(userId, message);
    }
  } catch (error) {
    console.log("Error sending announcement:", error);
  }
};

export const testAnnouncement = async (message: string) => {
  try {
    if (ENVIRONMENT.OWNER_ID) {
      await bot.telegram.sendMessage(ENVIRONMENT.OWNER_ID, message);
    }
  } catch (error) {
    console.log("Error sending test announcement:", error);
  }
};
