import { InjectQueue, Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { JobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  SyncAllDemarchePayload,
  SyncOneDemarchePayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job, Queue } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DemarcheSynchroniseService } from '@/modules/demarches/providers/services/demarche-synchronise.service'

@Processor(QueueName.sync)
export class DemarcheProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly demarcheService: DemarcheService,
    private readonly demarcheSynchroniseService: DemarcheSynchroniseService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Process(JobName.SyncAllDemarche)
  async syncAllDemarche(job: Job<SyncAllDemarchePayload>): Promise<void> {
    this.logger.verbose('sync all demarche')
    const demarcheIds = (
      await this.demarcheService.repository.find({
        select: ['id'],
      })
    ).map((d) => d.id)
    for (const id of demarcheIds) {
      this.logger.debug('Adding job to sync demarche ' + id)
      await this.syncQueue.add(JobName.SyncOneDemarche, {
        demarcheId: id,
        fromScratch: job.data.fromScratch,
      } as SyncOneDemarchePayload)
    }
    job.finished()
  }

  @Process(JobName.SyncOneDemarche)
  async syncOneDemarche(job: Job<SyncOneDemarchePayload>): Promise<void> {
    this.logger.verbose('sync one demarche')
    await this.demarcheSynchroniseService.synchroniseOneDemarche(job.data.demarcheId, job.data.fromScratch)
    job.finished()
  }
}
