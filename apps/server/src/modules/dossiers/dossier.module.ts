import { forwardRef, Module } from '@nestjs/common'
import { DossierService } from './providers/dossier.service'
import { DossierController } from './controllers/dossier.controller'
import { FileModule } from '../files/file.module'
import { InstructionTimesModule } from '@/modules/instruction_time/instruction_times.module'
import { DemarcheModule } from '../demarches/demarche.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Dossier } from './objects/entities/dossier.entity'
import { Field } from './objects/entities/field.entity'
import { FieldService } from './providers/field.service'
import { DossierSynchroniseService } from './providers/synchronization/dossier-synchronise.service'
import { DossierSearchService } from './providers/search/dossier-search.service'
import { FieldSearchService } from './providers/search/field-search.service'
import { OrganismeModule } from '@/modules/organismes/organisme.module'
import {
  DossierSynchroniseExcelService,
} from '@/modules/dossiers/providers/synchronization/excel/dossier-synchronise-excel.service'
import { XlsxModule } from '@/shared/modules/xlsx/xlsx.module'
import {
  DossierSynchroniseFileService,
} from '@/modules/dossiers/providers/synchronization/file/dossier-synchronize-file.service'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { BullModule, BullModuleOptions } from '@nestjs/bull'

@Module({
  imports: [
    FileModule,
    XlsxModule,
    forwardRef(() => InstructionTimesModule),
    forwardRef(() => DemarcheModule),
    forwardRef(() => OrganismeModule),
    TypeOrmModule.forFeature([Dossier, Field]),
    BullModule.registerQueue(
      ...([
        { name: QueueName.sync },
        { name: QueueName.file },
      ] as BullModuleOptions[]),
    ),
  ],
  controllers: [DossierController],
  providers: [
    DossierService,
    FieldService,

    DossierSearchService,
    FieldSearchService,

    DossierSynchroniseService,
    DossierSynchroniseFileService,
    DossierSynchroniseExcelService,
  ],
  exports: [
    DossierService,
    FieldService,

    DossierSearchService,
    FieldSearchService,

    DossierSynchroniseService,
  ],
})
export class DossierModule {}
