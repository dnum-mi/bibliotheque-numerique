import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BullModule, BullModuleOptions, SharedBullAsyncConfiguration } from '@nestjs/bull'
import { CustomBullService } from '@/shared/modules/custom-bull/custom-bull.service'
import { RedisModule } from '@/shared/modules/redis/redis.module'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { SyncQueueEventService } from '@/shared/modules/custom-bull/sync-queue-event.service'
import { FileQueueEventService } from '@/shared/modules/custom-bull/file-queue-event.service'
import { RedisService } from '@/shared/modules/redis/redis.service'
import Redis from 'ioredis'

@Module({
  imports: [
    RedisModule,
    BullModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: async (configService: ConfigService, redisService: RedisService) => ({
        createClient: (type: 'client' | 'subscriber' | 'bclient'): Redis => {
          const client = redisService.redisClient

          // Bull veut 3 connexions → on duplique la connexion
          if (type === 'client') {
            return client
          }
          return client.duplicate()
        },
        defaultJobOptions: {
          removeOnComplete: configService.get('bull').removeOnComplete,
          removeOnFail: configService.get('bull').removeOnFail,
          attempts: configService.get('bull').retryAttempts,
          timeout: 300_000, // 5 minutes
          backoff: {
            type: configService.get('bull').retryExponentiel
              ? 'exponential'
              : 'fixed',
            delay: configService.get('bull').retryDelay,
          },
        },
      }),
    } as SharedBullAsyncConfiguration),
    BullModule.registerQueue(
      ...([
        { name: QueueName.sync },
        { name: QueueName.file },
      ] as BullModuleOptions[]),
    ),
  ],
  providers: [CustomBullService, SyncQueueEventService, FileQueueEventService],
  exports: [CustomBullService, BullModule],
})
export class CustomBullModule {}
