import {
  forwardRef,
  Module,
} from '@nestjs/common'
import { HubService } from './providers/hub.service'
import { HubController } from '@/modules/hub/controllers/hub.controller'
import { Demarche } from '../demarches/objects/entities/demarche.entity'
import { Dossier } from '../dossiers/objects/entities/dossier.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PdfExportModule } from '@/shared/modules/pdf-export/pdf-export.module'
import { DossierModule } from '../dossiers/dossier.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Demarche, Dossier]),
    PdfExportModule,
    forwardRef(() => DossierModule),
  ],
  providers: [
    HubService,
  ],
  controllers: [HubController],
  exports: [HubService],
})
export class HubModule {}
