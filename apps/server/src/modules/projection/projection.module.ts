import { forwardRef, Module } from '@nestjs/common'
import { ProjectionManagerService } from './services/projection-manager/projection-manager.service'
import { DossierProjectionService } from './services/dossier-projection/dossier-projection.service'
import { FieldProjectionService } from './services/field-projection/field-projection.service'
import { ProjectionSearchService } from './services/projection-search/projection-search.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { DemarcheModule } from '@/modules/demarches/demarche.module'
import { ProjectionController } from '@/modules/projection/controllers/projection.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Demarche]),
    forwardRef(() => DemarcheModule),
  ],
  controllers: [
    ProjectionController,
  ],
  providers: [
    ProjectionManagerService,
    DossierProjectionService,
    FieldProjectionService,
    ProjectionSearchService,
  ],
  exports: [
    ProjectionManagerService,
    ProjectionSearchService,
  ],
})
export class ProjectionModule {}
