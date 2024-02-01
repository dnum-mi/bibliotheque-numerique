import { DynamicModule, Module } from '@nestjs/common'
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config'
import { BullModule, SharedBullAsyncConfiguration } from '@nestjs/bull'

@Module({})
export class CustomBullModule {
  static forRoot (): DynamicModule {
    return {
      module: CustomBullModule,
      imports: [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            redis: {
              host: configService.get('redis.host'),
              password: configService.get('redis.password'),
              port: configService.get('redis.port'),
              // maxRetriesPerRequest: configService.get('redis.maxRetriesPerRequest'),
              // maxLoadingRetryTime: configService.get('redis.maxLoadingRetryTime'),
            },
          }),
          inject: [ConfigService],
        } as SharedBullAsyncConfiguration),
      ],
      controllers: [],
      providers: [],
    }
  }
}
