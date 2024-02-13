import { Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { JobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { SyncAllDemarchePayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InstructionTimesService } from '@/modules/instruction_time/instruction_times.service'

@Processor(QueueName.sync)
export class InstructionTimeProcessor {
  constructor(private readonly logger: LoggerService,
              private readonly instructionTimesService: InstructionTimesService) {
    this.logger.setContext(this.constructor.name)
  }

  @Process(JobName.ComputeTimeTracking)
  async computeTimeTracking(job: Job<SyncAllDemarchePayload>): Promise<void> {
    this.logger.verbose('computeTimeTracking')
    await this.instructionTimesService.instructionTimeCalculationForAllDossier()
    job.finished()
  }
}
