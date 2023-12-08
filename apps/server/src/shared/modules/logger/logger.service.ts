import { ConsoleLogger, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService as LS } from '@nestjs/common/services/logger.service'
import { APP_NAME_TOKEN } from '@/shared/modules/logger/logger.const'
import * as Winston from 'winston'
import * as DailyRotateFile from 'winston-daily-rotate-file'
import { log } from 'winston'

@Injectable()
export class LoggerService extends ConsoleLogger implements LS {
  private fileLogger: Winston.Logger
  private clientFileLogger: Winston.Logger

  //#region Private
  private _createLogger(appName: string): Winston.Logger {
    return Winston.createLogger({
      transports: [
        new DailyRotateFile({
          filename: `logs/${appName}-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
      level: 'debug',
      format: Winston.format.combine(
        Winston.format.timestamp(),
        Winston.format.json(),
      ),
    })
  }

  private _stringifyMessage(message: unknown): string {
    if (typeof message === 'string') {
      return message
    } else if (message instanceof Error) {
      return message.stack || message.message
    } else {
      return JSON.stringify(message, null, 2) // Indentation for readability
    }
  }

  private _logToFile(level: string, message: string): void {
    if (this.fileLogger) {
      this.fileLogger.log({ level: level === 'log' ? 'info' : level, message })
    }
  }

  private _commonLogFunction(
    message: string | object | Error,
    logFunctionKey: 'log' | 'warn' | 'debug' | 'error' | 'verbose',
  ): void {
    const messageString = this._stringifyMessage(message)
    let logObject: object = {
      application: this.appName,
      level: logFunctionKey,
      context: this.context,
      timestamp: new Date().toISOString(),
    }

    if (typeof message === 'object') {
      logObject = { ...logObject, ...message }
    } else {
      logObject = { ...logObject, message: messageString }
    }

    if (this.configService.get('LOG_TO_FILE') === 'true') {
      this._logToFile(logFunctionKey, JSON.stringify(logObject))
    }

    if (!this.configService.get('isTest') && !this.configService.get('isDev')) {
      console.log(logObject)
    } else {
      super[logFunctionKey](messageString)
    }
  }
  //#endregion

  constructor(
    private readonly configService: ConfigService,
    @Inject(APP_NAME_TOKEN) private readonly appName: string,
  ) {
    super()
    if (this.configService.get('LOG_TO_FILE') === 'true') {
      this.fileLogger = this._createLogger(this.appName)
      this.clientFileLogger = this._createLogger('client')
    }
  }

  logClient(dto: object, level: 'info' | 'error' | 'warn'): void {
    if (this.configService.get('LOG_TO_FILE') === 'true') {
      this.clientFileLogger.log(level, dto)
    }
    if (!this.configService.get('isTest') && !this.configService.get('isDev')) {
      console.log(JSON.stringify({ ...dto, level }))
    }
  }

  log(message: string | object): void {
    if (this.configService.get('log.log')) {
      this._commonLogFunction(message, 'log')
    }
  }

  warn(message: string | object): void {
    if (this.configService.get('log.warn')) {
      this._commonLogFunction(message, 'warn')
    }
  }

  debug(message: string | object): void {
    if (this.configService.get('log.debug')) {
      this._commonLogFunction(message, 'debug')
    }
  }

  error(message: string | object | Error): void {
    if (this.configService.get('log.error')) {
      this._commonLogFunction(message, 'error')
    }
  }

  verbose(message: string | object): void {
    if (this.configService.get('log.verbose')) {
      this._commonLogFunction(message, 'verbose')
    }
  }
}
