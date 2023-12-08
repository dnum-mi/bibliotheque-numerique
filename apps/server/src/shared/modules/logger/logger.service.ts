import { ConsoleLogger, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService as LS } from '@nestjs/common/services/logger.service'
import { APP_NAME_TOKEN } from '@/shared/modules/logger/logger.const'

@Injectable()
export class LoggerService extends ConsoleLogger implements LS {
  constructor(private readonly configService: ConfigService,
              @Inject(APP_NAME_TOKEN) private readonly appName: string) {
    super()
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

  private _commonLogFunction(
    message: string | object | Error,
    logFunctionKey: 'log' | 'warn' | 'debug' | 'error' | 'verbose',
  ): void {
    const messageString = this._stringifyMessage(message)
    if (!this.configService.get('isTest') && !this.configService.get('isDev')) {
      let logObject = {
        application: this.appName,
        level: logFunctionKey,
        context: this.context,
        timestamp: new Date().toISOString(),
        messageString,
      }
      if (typeof message === 'object') {
        logObject = { ...logObject, ...message }
      }
      console.log(logObject)
    } else {
      super[logFunctionKey](messageString)
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
