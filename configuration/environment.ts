import dotenv from "dotenv";

dotenv.config();

const ENVIRONMENT = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATABASE_KEY: process.env.DATABASE_KEY || "",
};

export default ENVIRONMENT;
