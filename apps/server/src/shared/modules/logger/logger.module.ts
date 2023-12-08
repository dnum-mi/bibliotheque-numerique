import { Global, Module, Scope } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { ConfigService } from '@nestjs/config'

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
export class LoggerModule {}
