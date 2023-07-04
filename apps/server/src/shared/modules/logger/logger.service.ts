import { ConsoleLogger, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService as LS } from "@nestjs/common/services/logger.service";

@Injectable()
export class LoggerService extends ConsoleLogger implements LS {
  private _logs: string[] = [];
  private _isRegisteringLog = false;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  startRegisteringLogs(): void {
    this._logs = [];
    this._isRegisteringLog = true;
  }

  stopRegisteringLog(): string[] {
    this._isRegisteringLog = false;
    return this._logs;
  }

  private _commonLogFunction(
    message: string | object,
    logFunctionKey: "log" | "warn" | "debug" | "error" | "verbose",
  ): void {
    // TODO: cleaner way to manage object in log
    if (!(message instanceof String)) {
      message = JSON.stringify(message);
    }
    if (this._isRegisteringLog) {
      this._logs.push(JSON.stringify(message));
      if (this._logs.length > 1000) {
        this.warn("Stack of logs is now more than 1000 lines");
        this._logs.shift();
      }
    }
    super[logFunctionKey](message);
  }

  log(message: string | object): void {
    if (this.configService.get("log.log")) {
      this._commonLogFunction(message, "log");
    }
  }

  warn(message: string | object): void {
    if (this.configService.get("log.warn")) {
      this._commonLogFunction(message, "warn");
    }
  }

  debug(message: string | object): void {
    if (this.configService.get("log.debug")) {
      this._commonLogFunction(message, "debug");
    }
  }

  error(message: string | object): void {
    if (this.configService.get("log.error")) {
      this._commonLogFunction(message, "error");
    }
  }

  verbose(message: string | object): void {
    if (this.configService.get("log.verbose")) {
      this._commonLogFunction(message, "verbose");
    }
  }
}
