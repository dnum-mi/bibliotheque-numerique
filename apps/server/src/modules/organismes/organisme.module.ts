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

@Module({
  imports: [
    TypeOrmModule.forFeature([Organisme]),
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
  ],
  controllers: [OrganismeController, OrganismeFileController],
  providers: [OrganismeService, RnaService, RnfService],
  exports: [OrganismeService, RnfService, RnaService],
})
export class OrganismeModule {}
