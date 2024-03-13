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
          database: configService.get('redis').index,
          password: configService.get('redis.password'),
          port: configService.get('redis.port'),
          maxRetriesPerRequest: configService.get('redis.maxRetriesPerRequest'),
          maxLoadingRetryTime: configService.get('redis.maxLoadingRetryTime'),
        },
        defaultJobOptions: {
          removeOnComplete: configService.get('bull').removeOnComplete,
          removeOnFail: configService.get('bull').removeOnFail,
          attempts: configService.get('bull').retryAttempts,
          backoff: {
            type: configService.get('bull').retryExponentiel ? 'exponential' : 'fixed',
            delay: configService.get('bull').retryDelay,
          },
        },
      }),
      inject: [ConfigService],
    } as SharedBullAsyncConfiguration),
  ],
})
export class CustomBullModule {

}
