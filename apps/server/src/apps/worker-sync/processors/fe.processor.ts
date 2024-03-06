import { Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { ComputeFeExcelJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InstructionTimesService } from '@/modules/instruction_time/instruction_times.service'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  DossierSynchroniseExcelService,
} from '@/modules/dossiers/providers/synchronization/excel/dossier-synchronise-excel.service'

@Processor(QueueName.sync)
export class FeProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly instructionTimesService: InstructionTimesService,
    private readonly dossierExcelSynchroniseService: DossierSynchroniseExcelService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Process(eJobName.ComputeTimeTracking)
  async computeTimeTracking(): Promise<void> {
    this.logger.verbose('computeTimeTracking')
    await this.instructionTimesService.instructionTimeCalculationForAllDossier()
  }

  @Process(eJobName.ComputeFeExcel)
  async computeFeExcel(job: Job<ComputeFeExcelJobPayload>): Promise<void> {
    this.logger.verbose('computeFeExcel')
    try {
      await this.dossierExcelSynchroniseService.synchroniseExcel(job.data.file)
    } catch (e) {
      this.logger.error(e)
      return Promise.reject(e)
    }
  }
}
