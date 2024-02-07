import { Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { BullModule, BullModuleOptions } from '@nestjs/bull'

@Module({
  imports: [
    BullModule.registerQueue(...[{ name: QueueName.sync }, { name: QueueName.file }] as BullModuleOptions[]),
  ],
  controllers: [],
  providers: [CronService],
})
export class CronModule {}
