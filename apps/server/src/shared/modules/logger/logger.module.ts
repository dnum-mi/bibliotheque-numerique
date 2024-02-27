import { DynamicModule, Global, Module, Scope } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { ConfigService } from '@nestjs/config'
import { APP_NAME_TOKEN } from '@/shared/modules/logger/logger.const'

@Global()
@Module({})
export class LoggerModule {
  static forRoot(appName: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: APP_NAME_TOKEN,
          useValue: appName,
        },
        {
          provide: LoggerService,
          useFactory: (
            configService: ConfigService,
            appName: string,
          ): LoggerService => {
            return new LoggerService(configService, appName)
          },
          scope: Scope.TRANSIENT,
          inject: [ConfigService, APP_NAME_TOKEN],
        },
      ],
      exports: [LoggerService],
    }
  }
}
