import { Injectable, LoggerService as LoggerServiceNest } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as winston from "winston";
import * as dayjs from "dayjs";
import * as colors from "colors";

type TLoggerObject = {
  short_message?: string;
  full_message: string;
  version?: string;
  host?: string;
  timestamp?: number;
  _service_name?: string;
  error?: Error;
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  datas?: any;
};

@Injectable()
export class LoggerService implements LoggerServiceNest {
  logger: winston.Logger;
  private _logs: string[] = [];
  private _isRegisteringLog = false;

  constructor(private configService: ConfigService) {
    const { printf } = winston.format;
    // TODO: fixe type
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const customFormat = (colored?: boolean) =>
      printf(({ level, message }) => {
        const { short_message, full_message, _service_name } = message;
        const initMessage = `${dayjs().format(
          this.configService.get<string>("log.date_format"),
        )} ${
          _service_name &&
          (colored ? colors.yellow(`[${_service_name}]`) : `[${_service_name}]`)
        }`;
        let endMessage = `${level.toUpperCase()}: ${
          short_message ? `(${short_message}) ` : ""
        }${full_message}`;
        if (colored) {
          switch (level) {
            case "error":
              endMessage = colors.red.bold(endMessage);
              break;
            case "warn":
              endMessage = colors.yellow.bold(endMessage);
              break;
            case "info":
              endMessage = colors.blue.bold(endMessage);
              break;
            case "debug":
              endMessage = colors.bgRed.bold(endMessage);
              break;
          }
        }
        return `${initMessage} ${endMessage}`;
      });
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          level: "error",
          format: customFormat(),
        }),
        new winston.transports.Console({
          level: "warn",
          format: customFormat(),
        }),
        new winston.transports.Console({
          level: "info",
          format: customFormat(true),
        }),
      ],
      exceptionHandlers: [
        new winston.transports.Console({
          format: customFormat(),
        }),
      ],
    });
  }

  private _toCompleteLoggerObject(loggerObject: TLoggerObject): TLoggerObject {
    return {
      version: process.env.npm_package_version || "",
      host: process.env.HOST || "",
      timestamp: dayjs().unix(),
      _service_name: "",
      ...loggerObject,
    };
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  log(message: string | TLoggerObject /* ...optionalParams: any[] */) {
    const loggerObject = this._toCompleteLoggerObject(
      typeof message === "string" ? { full_message: message } : message,
    );
    if (this._isRegisteringLog) {
      this._logs.push(JSON.stringify(loggerObject));
      if (this._logs.length > 1000) {
        this.logger.warn("Stack of logs is now more than 1000 lines");
        this._logs.shift();
      }
    }
    this.logger[logFunctionKey](loggerObject);
  }
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  error(message: string | TLoggerObject /* ...optionalParams: any[] */) {
    const loggerObject = this._toCompleteLoggerObject(
      typeof message === "string" ? { full_message: message } : message,
    );
    this.logger.error(loggerObject);
  }
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  warn(message: string | TLoggerObject /* ...optionalParams: any[] */) {
    const loggerObject = this._toCompleteLoggerObject(
      typeof message === "string" ? { full_message: message } : message,
    );
    this.logger.warn(loggerObject);
  }
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  debug(message: string | TLoggerObject /* ...optionalParams: any[] */) {
    const loggerObject = this._toCompleteLoggerObject(
      typeof message === "string" ? { full_message: message } : message,
    );
    this.logger.debug(loggerObject);
  }
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  verbose(message: string | TLoggerObject /* ...optionalParams: any[] */) {
    const loggerObject = this._toCompleteLoggerObject(
      typeof message === "string" ? { full_message: message } : message,
    );
    this.logger.verbose(loggerObject);
  }
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  silly(message: string | TLoggerObject /* ...optionalParams: any[] */) {
    const loggerObject = this._toCompleteLoggerObject(
      typeof message === "string" ? { full_message: message } : message,
    );
    this.logger.verbose(loggerObject);
  }
}
