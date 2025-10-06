import { forwardRef, Module } from '@nestjs/common'
import { DossierService } from './providers/dossier.service'
import { DossierController } from './controllers/dossier.controller'
import { FileModule } from '../files/file.module'
import { InstructionTimesModule } from '@/modules/instruction_time/instruction_times.module'
import { DemarcheModule } from '../demarches/demarche.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Dossier } from './objects/entities/dossier.entity'
import { Field } from './objects/entities/field.entity'
import { File } from '../files/objects/entities/file.entity'
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
import { BnConfigurationModule } from '@/shared/modules/bn-configurations/bn-configuration.module'
import {
  DossierSynchroniseOrganismeService,
} from '@/modules/dossiers/providers/synchronization/organisme/dossier-synchronise-organisme.service'
import { DossierFileController } from '@/modules/dossiers/controllers/dossier-file.controller'
import { CustomBullModule } from '@/shared/modules/custom-bull/custom-bull.module'

@Module({
  imports: [
    FileModule,
    XlsxModule,
    forwardRef(() => InstructionTimesModule),
    forwardRef(() => DemarcheModule),
    forwardRef(() => OrganismeModule),
    TypeOrmModule.forFeature([Dossier, Field, File]),
    BullModule.registerQueue(
      ...([
        { name: QueueName.sync },
        { name: QueueName.file },
      ] as BullModuleOptions[]),
    ),
    CustomBullModule,
    BnConfigurationModule,
  ],
  controllers: [DossierController, DossierFileController],
  providers: [
    DossierService,
    FieldService,
    DossierSearchService,
    FieldSearchService,
    DossierSynchroniseService,
    DossierSynchroniseFileService,
    DossierSynchroniseExcelService,
    DossierSynchroniseOrganismeService,
  ],
  exports: [
    DossierService,
    FieldService,
    DossierSearchService,
    FieldSearchService,
    DossierSynchroniseExcelService,
    DossierSynchroniseService,
  ],
})
export class DossierModule {}
