import { CronJob } from "cron";
import ENVIRONMENT from "../../configuration/environment";

const SCHEDUELD_TIME = "00 */14 * * * *"; // Every 14 minutes

const selfPing = async () => {
  await fetch(ENVIRONMENT.WEBHOOK_DOMAIN);
};

export const initStayAlive = () => {
  new CronJob(
    SCHEDUELD_TIME, // cronTime
    () => selfPing(),
    null,
    true,
    null,
    null,
    null,
    +480 // UTC+8, represented in minutes
  );
};
