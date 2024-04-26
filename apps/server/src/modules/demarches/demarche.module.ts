import { forwardRef, Module } from '@nestjs/common'
import { DemarcheController } from './controllers/demarche.controller'
import { DemarcheService } from './providers/services/demarche.service'
import { DossierModule } from '../dossiers/dossier.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Demarche } from './objects/entities/demarche.entity'
import { DemarcheSynchroniseService } from './providers/services/demarche-synchronise.service'
import { DemarcheConfigurationController } from './controllers/demarche-configuration.controller'
import { DemarcheDossierController } from './controllers/demarche-dossier.controller'
import { CustomFilterModule } from '@/modules/custom-filters/custom-filter.module'
import { DemarcheCustomFilterController } from '@/modules/demarches/controllers/demarche-custom-filter.controller'
import { DsApiModule } from '@/shared/modules/ds-api/ds-api.module'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { BullModule, BullModuleOptions } from '@nestjs/bull'
import { DemarcheOptionController } from '@/modules/demarches/controllers/demarche-option.controller'
import { CustomBullModule } from '@/shared/modules/custom-bull/custom-bull.module'

@Module({
  imports: [
    forwardRef(() => DossierModule),
    TypeOrmModule.forFeature([Demarche]),
    BullModule.registerQueue({ name: QueueName.sync } as BullModuleOptions),
    CustomFilterModule,
    CustomBullModule,
    DsApiModule,
  ],
  controllers: [
    DemarcheController,
    DemarcheDossierController,
    DemarcheConfigurationController,
    DemarcheCustomFilterController,
    DemarcheOptionController,
  ],
  providers: [DemarcheService, DemarcheSynchroniseService],
  exports: [DemarcheService, DemarcheSynchroniseService],
})
export class DemarcheModule {}
