export const generateTimestamp = (date = new Date()) => {
  const pad = (n: number, width: number = 2) =>
    n.toString().padStart(width, "0");

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  const milliseconds = pad(date.getUTCMilliseconds(), 3);

  const extraMicros = "000";

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}${extraMicros}+00`;
};
