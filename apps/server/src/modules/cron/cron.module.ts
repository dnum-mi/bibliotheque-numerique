import { Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { DossierModule } from '../dossiers/dossier.module'
import { JobLogModule } from '../job-log/job-log.module'
import { DemarcheModule } from '../demarches/demarche.module'
import { OrganismesModule } from '../../plugins/organisme/organismes/organismes.module'

@Module({
  imports: [DossierModule, DemarcheModule, JobLogModule, OrganismesModule],
  controllers: [],
  providers: [CronService],
})
export class CronModule {}
