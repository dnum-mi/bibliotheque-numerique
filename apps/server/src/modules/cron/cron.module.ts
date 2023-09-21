import { Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { DossierModule } from '../dossiers/dossier.module'
import { JobLogModule } from '../job-log/job-log.module'
import { DemarcheModule } from '../demarches/demarche.module'
import { OrganismesModule } from '../../plugins/organisme/organismes/organismes.module'
import { InstructionTimesModule } from '../../plugins/instruction_time/instruction_times/instruction_times.module'
import { XlsxModule } from '../../shared/modules/xlsx/xlsx.module'

@Module({
  imports: [
    DossierModule,
    DemarcheModule,
    OrganismesModule,
    JobLogModule,
    OrganismesModule,
    InstructionTimesModule,
    XlsxModule,
  ],
  controllers: [],
  providers: [CronService],
})
export class CronModule {}
