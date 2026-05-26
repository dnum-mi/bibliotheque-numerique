import { ConsoleLogger, Inject, Injectable, Scope } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService as LS } from '@nestjs/common/services/logger.service'
import * as Winston from 'winston'
import * as DailyRotateFile from 'winston-daily-rotate-file'
import { iLogPayload } from '@/shared/modules/logger/log-payload.interface'
import { ContextLoggerService } from '@/shared/modules/logger/context-logger.service'
import axios from 'axios'
import { APP_NAME_SYMBOL } from '@/apps/apps.const'

@Injectable({ scope: Scope.TRANSIENT })
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
    }

    if (message instanceof Error) {
      return message.stack ?? message.message
    }

    return JSON.stringify(message)
  }

  // Transform input message into a structured log payload
  private _buildLogObject(
    message: string | object | Error | undefined,
    level: 'log' | 'warn' | 'debug' | 'error' | 'verbose',
  ): iLogPayload {
    const logObject: iLogPayload = {
      application: this.appName,
      level,
      context: this.context,
      timestamp: new Date().toISOString(),
      message: '',
    }

    if (message === null) {
      message = 'null'
      logObject.message = 'null'
    }

    if (message === undefined) {
      message = 'undefined'
      logObject.message = 'undefined'
    }

    if (message instanceof Error) {
      logObject.message = message.message

      logObject.payload = {
        errorName: message.name,
        errorMessage: message.message,
        payload_stack: message.stack,
      }

      return logObject
    }

    if (typeof message === 'string') {
      logObject.message = message
      return logObject
    }

    const obj = message as Record<string, unknown>

    logObject.payload = obj

    // message principal
    if (typeof obj?.message === 'string') {
      logObject.message = obj?.message || 'log of object undefined'
    }

    // Extraction intelligente d'erreur imbriquée
    const possibleError =
      obj?.error instanceof Error
        ? obj.error
        : obj.exception instanceof Error
          ? obj.exception
          : null

    if (possibleError) {
      logObject.payload = {
        ...obj,
        errorName: possibleError.name,
        errorMessage: possibleError.message,
        payload_stack: possibleError.stack,
      }
    }

    return logObject
  }

  private _logToFile(
    payload: iLogPayload,
    transporter: 'client' | 'default',
  ): void {
    const level = payload.level === 'log' ? 'info' : payload.level

    const logger =
      transporter === 'client' ? this.clientFileLogger : this.fileLogger

    if (logger) {
      logger.log({ ...payload, level })
    }
  }

  private _shouldIgnoreNestLog(message: string): boolean {
    return message && (
      message.startsWith('Mapped {') ||
      message.endsWith(' route') ||
      message.endsWith('}:') ||
      message.includes('Controller {/')
    )
  }

  private _commonLogFunction(
    message: string | object | Error,
    level: 'log' | 'warn' | 'debug' | 'error' | 'verbose',
  ): void {
    if (typeof message === 'string' && this._shouldIgnoreNestLog(message)) {
      return
    }

    const messageString = this._stringifyMessage(message)

    let logObject = this._buildLogObject(message, level)

    // extend with ALS context
    if (this.contextLog) {
      logObject = this.contextLog.extendLogObjectWithStoreValues(logObject)
    }

    // file logging
    if (this.configService.get('LOG_TO_FILE') === 'true') {
      this._logToFile(logObject, 'default')
    }

    // bull / async context logging
    if (this.contextLog) {
      this.contextLog.contextLog(logObject)
    }

    // stdout
    if (this.configService.get('isFriendlyLog')) {
      super[level](messageString)
      return
    }

    console.log(JSON.stringify(logObject))
  }
  //#endregion

  constructor(
    private readonly configService: ConfigService,
    @Inject(APP_NAME_SYMBOL) private readonly appName: string,
    private readonly contextLog?: ContextLoggerService,
  ) {
    super()

    this.setLogLevels(['log', 'error', 'warn', 'debug', 'verbose'])

    if (this.configService.get('LOG_TO_FILE') === 'true') {
      this.fileLogger = this._createLogger(this.appName)
      this.clientFileLogger = this._createLogger('client')
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

  createChild(context: string): LoggerService {
    const child = Object.create(this) as LoggerService
    child.setContext(context)
    return child
  }

  axiosDebug(error: Error): void {
    if (axios.isAxiosError(error)) {
      this.debug({
        message: 'HUB Dependency full debug',
        request: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers,
          data: error.config?.data,
          rawHeaders: error.request?.res?.rawHeaders,
        },
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data,
          config: error.response?.config,
        },
        network: {
          host: error.request?.host,
          protocol: error.request?.protocol,
          path: error.request?.path,
          reusedSocket: error.request?.reusedSocket,
        },
        socket: {
          remoteAddress: error.request?.socket?.remoteAddress,
          remotePort: error.request?.socket?.remotePort,
          localAddress: error.request?.socket?.localAddress,
          localPort: error.request?.socket?.localPort,
        },
        dns: {
          hostname: error.request?.host,
        },
      })
    }
  }
}
