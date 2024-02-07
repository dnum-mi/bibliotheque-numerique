import { Module } from '@nestjs/common'
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config'
import { BullModule, SharedBullAsyncConfiguration } from '@nestjs/bull'

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          password: configService.get('redis.password'),
          port: configService.get('redis.port'),
          maxRetriesPerRequest: configService.get('redis.maxRetriesPerRequest'),
          maxLoadingRetryTime: configService.get('redis.maxLoadingRetryTime'),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: true,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
        },
      }),
      inject: [ConfigService],
    } as SharedBullAsyncConfiguration),
  ],
})
export class CustomBullModule {

}
