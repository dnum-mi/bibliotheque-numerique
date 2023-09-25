import { ConsoleLogger, HttpException, Injectable, LoggerService as LS } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class LoggerService extends ConsoleLogger implements LS {
  constructor (private readonly config: ConfigService) {
    super()
  }

  log (...messages: string[]) {
    if (this.config.get('log.log')) {
      messages.forEach((message) => super.log(message))
    }
  }

  verbose (...messages: string[]) {
    if (this.config.get('log.verbose')) {
      messages.forEach((message) => super.verbose(message))
    }
  }

  error (error: Error | string): void {
    if (this.config.get('log.error')) {
      if (error instanceof Error) {
        super.error(error.name + ': ' + error.message)
        this.debug(error.stack!)
      } else {
        super.error(error)
      }
    }
  }

  warn (...messages: (string | HttpException | undefined)[]) {
    if (this.config.get('log.warn')) {
      messages.forEach((message) => {
        if (message instanceof HttpException) {
          super.warn(`${message.getStatus()}: ${message.message}`)
          this.debug(message.stack!)
        } else {
          super.warn(`${message ?? ''}`)
        }
      })
    }
  }

  debug (...messages: string[]) {
    if (this.config.get('log.debug')) {
      messages.forEach((message) => super.debug(message))
    }
  }
}
