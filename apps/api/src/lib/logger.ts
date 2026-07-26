import pino, { type LoggerOptions } from "pino";
import { env } from "./env.js";

const options: LoggerOptions = {
  level: env.NODE_ENV === "production" ? "info" : "debug",
};

if (env.NODE_ENV === "development") {
  options.transport = {
    target: "pino-pretty",
    options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
  };
}

export const logger = pino(options);
