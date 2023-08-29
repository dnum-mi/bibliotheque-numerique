import { forwardRef, Module } from '@nestjs/common'
import { DossierService } from './providers/dossier.service'
import { DossierController } from './controllers/dossier.controller'
import { FilesModule } from '../files/files.module'
import { InstructionTimesModule } from '../../plugins/instruction_time/instruction_times/instruction_times.module'
import { DemarcheModule } from '../demarches/demarche.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Dossier } from './objects/entities/dossier.entity'
import { Field } from './objects/entities/field.entity'
import { FieldService } from './providers/field.service'
import { DossierSynchroniseService } from './providers/dossier-synchronise.service'
import { DossierSearchService } from './providers/dossier-search.service'
import { FieldSearchService } from './providers/field-search.service'

@Module({
  imports: [
    FilesModule,
    forwardRef(() => InstructionTimesModule),
    forwardRef(() => DemarcheModule),
    TypeOrmModule.forFeature([Dossier, Field]),
  ],
  controllers: [DossierController],
  providers: [DossierService, DossierSearchService, DossierSynchroniseService, FieldService, FieldSearchService],
  exports: [DossierService, DossierSearchService, DossierSynchroniseService, FieldService, FieldSearchService],
})
export class DossierModule {}
