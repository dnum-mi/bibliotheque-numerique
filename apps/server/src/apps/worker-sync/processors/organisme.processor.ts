import { InjectQueue, Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { JobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  SyncOneRnaOrganismePayload,
  SyncOneRnfOrganismePayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job, Queue } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { WorkerSyncService } from '@/apps/worker-sync/worker-sync.service'
import { RnfService } from '@/modules/organismes/providers/rnf.service'

@Processor(QueueName.sync)
export class OrganismeProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly rnfService: RnfService,
    private readonly organismeService: OrganismeService,
    private readonly workerSyncService: WorkerSyncService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Process(JobName.SyncAllRnaOrganisme)
  async syncAllRnaOrganisme(job: Job<void>): Promise<void> {
    // TODO: const rnas = await this.organismeService.getAllRnaOrganisme()
    // TODO: There is no way as of this time to have the last updated rna organisme from the rna api.
    job.finished()
  }

  @Process(JobName.SyncAllRnfOrganisme)
  async syncAllRnfOrganisme(job: Job<void>): Promise<void> {
    const rnfs = await this.organismeService.getAllRnfOrganisme()
    const lastSynchronisedAt = await this.workerSyncService.getOrganismeRnfLastSynchronisedAt()
    const modifiedRnfIds = await this.rnfService.getUpdatedFoundations({
      lastUpdatedAt: lastSynchronisedAt.toISOString(),
      rnfIds: rnfs.map(r => r.idRnf),
    })
    for (const rnfId of modifiedRnfIds) {
      this.syncQueue.add(JobName.SyncOneRnfOrganisme, {
        rnf: rnfId,
      } as SyncOneRnfOrganismePayload)
    }
    await this.workerSyncService.setOrganismeRnfLastSynchronisedAt(new Date())
    job.finished()
  }

  @Process(JobName.SyncOneRnfOrganisme)
  async syncOneRnfOrganisme(
    job: Job<SyncOneRnfOrganismePayload>,
  ): Promise<void> {
    this.logger.verbose('syncOneRnfOrganisme')
    await this.organismeService.upsertOrganismeRnf(job.data.rnf)
    job.finished()
  }

  @Process(JobName.SyncOneRnaOrganisme)
  async syncOneRnaOrganisme(
    job: Job<SyncOneRnaOrganismePayload>,
  ): Promise<void> {
    this.logger.verbose('syncOneRnaOrganisme')
    await this.organismeService.upsertOrganismeRna(job.data.rna)
    job.finished()
  }
}
