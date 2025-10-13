import dotenv from "dotenv";

dotenv.config();

const ENVIRONMENT = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATABASE_KEY: process.env.DATABASE_KEY || "",
  WEBHOOK_DOMAIN: process.env.WEBHOOK_DOMAIN || "",
  PAUSE_SERVICE: process.env.PAUSE_SERVICE === "true",
  OWNER_ID: process.env.OWNER_ID || "",
  BROWERLESS_TOKEN: process.env.BROWERLESS_TOKEN || "",
};

export default ENVIRONMENT;
