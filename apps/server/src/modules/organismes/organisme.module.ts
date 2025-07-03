import { forwardRef, Module } from '@nestjs/common'
import { OrganismeController } from '@/modules/organismes/controllers/organisme.controller'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { RnaService } from '@/modules/organismes/providers/rna.service'
import { RnfService } from '@/modules/organismes/providers/rnf.service'
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

@Module({
  imports: [
    TypeOrmModule.forFeature([Organisme, SyncState]),
    forwardRef(() => DossierModule),
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
  ],
  controllers: [OrganismeController, OrganismeFileController],
  providers: [OrganismeService, RnaService, RnfService, OrganismeSyncStateService],
  exports: [OrganismeService, RnfService, RnaService, OrganismeSyncStateService],
})
export class OrganismeModule {}
