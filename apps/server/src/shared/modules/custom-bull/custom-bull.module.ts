import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BullModule, BullModuleOptions, SharedBullAsyncConfiguration } from '@nestjs/bull'
import { CustomBullService } from '@/shared/modules/custom-bull/custom-bull.service'
import { RedisModule } from '@/shared/modules/redis/redis.module'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'

@Module({
  imports: [
    RedisModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis').host,
          database: configService.get('redis').index,
          password: configService.get('redis').password,
          port: configService.get('redis').port,
          maxRetriesPerRequest: configService.get('redis.maxRetriesPerRequest'),
          maxLoadingRetryTime: configService.get('redis.maxLoadingRetryTime'),
        },
        defaultJobOptions: {
          removeOnComplete: configService.get('bull').removeOnComplete,
          removeOnFail: configService.get('bull').removeOnFail,
          attempts: configService.get('bull').retryAttempts,
          backoff: {
            type: configService.get('bull').retryExponentiel
              ? 'exponential'
              : 'fixed',
            delay: configService.get('bull').retryDelay,
          },
        },
      }),
      inject: [ConfigService],
    } as SharedBullAsyncConfiguration),
    BullModule.registerQueue(
      ...([
        { name: QueueName.sync },
        { name: QueueName.file },
      ] as BullModuleOptions[]),
    ),
  ],
  providers: [CustomBullService],
  exports: [CustomBullService],
})
export class CustomBullModule {}
