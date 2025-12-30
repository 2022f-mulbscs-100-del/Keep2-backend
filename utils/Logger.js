import winston from "winston";

export const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "info",
      format: winston.format.json(),
    }),
    // new winston.transports.Http({
    //   level: 'warn',
    //   format: winston.format.json()
    // }), //to send logs to a remote server like datadog, splunk etc.
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return Object.keys(meta).length
            ? `[${timestamp}] [${level}]: ${message} ${JSON.stringify(meta)}`
            : `[${timestamp}] [${level}]: ${message}`;
        })
      ),
    }),
  ],
});
