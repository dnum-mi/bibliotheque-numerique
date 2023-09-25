import { forwardRef, Module } from '@nestjs/common'
import { DsService } from '@/modules/ds/providers/ds.service'
import { DsMapperService } from '@/modules/ds/providers/ds-mapper.service'
import { DsConfigurationController } from '@/modules/ds/controllers/ds-configuration.controller'
import { DsConfigurationService } from '@/modules/ds/providers/ds-configuration.service'
import { DsController } from '@/modules/ds/controllers/ds.controller'
import { FoundationModule } from '@/modules/foundation/foundation.module'
import { CronModule } from '@/modules/cron/cron.module'

@Module({
  imports: [forwardRef(() => FoundationModule), forwardRef(() => CronModule)],
  controllers: [DsConfigurationController, DsController],
  providers: [DsService, DsMapperService, DsConfigurationService],
  exports: [DsService, DsMapperService, DsConfigurationService],
})
export class DsModule {}
