import { Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { DossierModule } from '../dossiers/dossier.module'
import { DemarcheModule } from '../demarches/demarche.module'
import { InstructionTimesModule } from '@/modules/instruction_time/instruction_times.module'
import { XlsxModule } from '@/shared/modules/xlsx/xlsx.module'

@Module({
  imports: [
    DossierModule,
    DemarcheModule,
    InstructionTimesModule,
    XlsxModule,
  ],
  controllers: [],
  providers: [CronService],
})
export class CronModule {}
