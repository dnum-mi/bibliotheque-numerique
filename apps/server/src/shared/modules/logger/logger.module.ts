import { Global, MiddlewareConsumer, Module, Scope } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { ConfigService } from '@nestjs/config'
import { MorganMiddleware } from '@nest-middlewares/morgan'
import { jsonFormat } from './morgan-jsonformat.function'

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: LoggerService,
      inject: [ConfigService],
      useFactory: (config: ConfigService): LoggerService => {
        return new LoggerService(config)
      },
      scope: Scope.TRANSIENT,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {
  constructor (private readonly config: ConfigService, private readonly loggerService: LoggerService) {
    this.loggerService.setContext(this.constructor.name)
  }

  configure (consumer: MiddlewareConsumer): void {
    this.config.get('isDev')
      ? MorganMiddleware.configure(':method :url :status    (:response-time ms)', {
        stream: {
          // delete last two characters (line break and carriage return)
          write: (message) => this.loggerService.log(message.substring(0, message.length - 1)),
        },
      })
      : MorganMiddleware.configure(jsonFormat)
    if (!this.config.get('isTest')) {
      consumer.apply(MorganMiddleware).forRoutes('*')
    }
  }
}
