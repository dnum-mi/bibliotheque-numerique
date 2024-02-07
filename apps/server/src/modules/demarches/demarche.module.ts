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

@Module({
  imports: [
    forwardRef(() => DossierModule),
    TypeOrmModule.forFeature([Demarche]),
    CustomFilterModule,
    DsApiModule,
  ],
  controllers: [
    DemarcheController,
    DemarcheDossierController,
    DemarcheConfigurationController,
    DemarcheCustomFilterController,
  ],
  providers: [DemarcheService, DemarcheSynchroniseService],
  exports: [DemarcheService, DemarcheSynchroniseService],
})
export class DemarcheModule {}
