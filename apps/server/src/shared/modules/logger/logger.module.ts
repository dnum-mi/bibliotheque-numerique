import { DynamicModule, Global, Module, Scope } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { ConfigService } from '@nestjs/config'
import { APP_NAME_TOKEN } from '@/shared/modules/logger/logger.const'
import { AlsModule } from '@/shared/modules/als/als.module'
import { ContextLoggerService } from '@/shared/modules/logger/context-logger.service'

@Global()
@Module({})
export class LoggerModule {
  static forRoot(appName: string): DynamicModule {
    return {
      module: LoggerModule,
      imports: [AlsModule],
      providers: [
        {
          provide: APP_NAME_TOKEN,
          useValue: appName,
        },
        ContextLoggerService,
        {
          provide: LoggerService,
          useFactory: (
            configService: ConfigService,
            appName: string,
            contextLoggerService: ContextLoggerService,
          ): LoggerService => {
            return new LoggerService(configService, appName, contextLoggerService)
          },
          scope: Scope.TRANSIENT,
          inject: [ConfigService, APP_NAME_TOKEN, ContextLoggerService],
        },
      ],
      exports: [LoggerService],
    }
  }
}
