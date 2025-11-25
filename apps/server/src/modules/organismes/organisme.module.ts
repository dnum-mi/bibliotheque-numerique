import { forwardRef, Module } from '@nestjs/common'
import { OrganismeController } from '@/modules/organismes/controllers/organisme.controller'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { RnaService } from '@/modules/organismes/providers/rna.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { DossierModule } from '@/modules/dossiers/dossier.module'
import { XlsxModule } from '../../shared/modules/xlsx/xlsx.module'
import { FileModule } from '@/modules/files/file.module'
import { OrganismeFileController } from '@/modules/organismes/controllers/organisme-file.controller'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { BullModule, BullModuleOptions } from '@nestjs/bull'
import { BnConfigurationModule } from '@/shared/modules/bn-configurations/bn-configuration.module'
import { HubModule } from '@/modules/hub/hub.module'
import { OrganismeSyncStateService } from './providers/organisme-sync-state.service'
import { SyncState } from '../../shared/sync-state/objects/entities/sync-state.entity'
import { OrganismeSyncService } from './providers/organisme-sync.service'
import { OrganismeRnaService } from './providers/organisme-rna.service'
import { CustomBullModule } from '@/shared/modules/custom-bull/custom-bull.module'
import { DemarcheModule } from '../demarches/demarche.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Organisme, SyncState]),
    forwardRef(() => DossierModule),
    forwardRef(() => DemarcheModule),
    BullModule.registerQueue(
      ...([
        { name: QueueName.sync },
        { name: QueueName.file },
      ] as BullModuleOptions[]),
    ),
    XlsxModule,
    FileModule,
    BnConfigurationModule,
    HubModule,
    CustomBullModule,
  ],
  controllers: [OrganismeController, OrganismeFileController],
  providers: [
    OrganismeService,
    RnaService,
    OrganismeSyncStateService,
    OrganismeSyncService,
    OrganismeRnaService,
  ],
  exports: [
    OrganismeService,
    RnaService,
    OrganismeSyncStateService,
    OrganismeSyncService,
    OrganismeRnaService],
})
export class OrganismeModule {}
