import { forwardRef, Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { FoundationModule } from '@/modules/foundation/foundation.module'
import { ScheduleModule } from '@nestjs/schedule'
import { DsModule } from '@/modules/ds/ds.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    forwardRef(() => DsModule),
    forwardRef(() => FoundationModule),
  ],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
