import { Module } from '@nestjs/common'
import { HubService } from './providers/hub.service'
import { HubController } from '@/modules/hub/controllers/hub.controller'
import { Demarche } from '../demarches/objects/entities/demarche.entity'
import { Dossier } from '../dossiers/objects/entities/dossier.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmModule.forFeature([Demarche, Dossier]),
  ],
  providers: [
    HubService,
  ],
  controllers: [HubController],
  exports: [HubService],
})
export class HubModule {}
