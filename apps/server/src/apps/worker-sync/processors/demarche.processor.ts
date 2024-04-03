import { InjectQueue, Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  SyncAllDemarcheJobPayload,
  SyncOneDemarcheJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job, Queue } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DemarcheSynchroniseService } from '@/modules/demarches/providers/services/demarche-synchronise.service'
import { ConfigService } from '@nestjs/config'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { AsyncLocalStorage } from 'async_hooks'
import { AsyncLocalStore } from '@/shared/modules/als/async-local-store.type'
import { Inject } from '@nestjs/common'

@Processor(QueueName.sync)
export class DemarcheProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly demarcheService: DemarcheService,
    private readonly demarcheSynchroniseService: DemarcheSynchroniseService,
    private readonly configService: ConfigService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
    @Inject(ALS_INSTANCE) private readonly als?: AsyncLocalStorage<AsyncLocalStore>,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Process(eJobName.SyncAllDemarche)
  async syncAllDemarche(job: Job<SyncAllDemarcheJobPayload>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('sync all demarche')
      const demarcheIds = (
        await this.demarcheService.repository.find({
          select: ['id'],
        })
      ).map((d) => d.id)
      for (const id of demarcheIds) {
        this.logger.debug('Adding job to sync demarche ' + id)
        await this.syncQueue.add(eJobName.SyncOneDemarche, {
          demarcheId: id,
          fromScratch: job.data.fromScratch,
        } as SyncOneDemarcheJobPayload)
      }
    })
  }

  @Process(eJobName.SyncOneDemarche)
  async syncOneDemarche(job: Job<SyncOneDemarcheJobPayload>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('sync one demarche')
      await this.demarcheSynchroniseService.synchroniseOneDemarche(job.data.demarcheId, job.data.fromScratch, job)
    })
  }
}
