import { InjectQueue, Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  SyncOneRnaOrganismeJobPayload,
  SyncOneRnfOrganismeJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job, Queue } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { RnfService } from '@/modules/organismes/providers/rnf.service'
import { BnConfigurationService } from '@/shared/modules/bn-configurations/providers/bn-configuration.service'
import { eBnConfiguration } from '@biblio-num/shared'

@Processor(QueueName.sync)
export class OrganismeProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly rnfService: RnfService,
    private readonly organismeService: OrganismeService,
    private readonly bnConfiguration: BnConfigurationService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Process(eJobName.SyncAllRnaOrganisme)
  async syncAllRnaOrganisme(job: Job<void>): Promise<void> {
    // TODO: const rnas = await this.organismeService.getAllRnaOrganisme()
    // TODO: There is no way as of this time to have the last updated rna organisme from the rna api.
    job.finished()
  }

  @Process(eJobName.SyncAllRnfOrganisme)
  async syncAllRnfOrganisme(job: Job<void>): Promise<void> {
    const rnfs = await this.organismeService.getAllRnfOrganisme()
    const lastSyncConfig = await this.bnConfiguration.findByKeyName(eBnConfiguration.LAST_ORGANISM_SYNC_AT)
    const modifiedRnfIds = await this.rnfService.getUpdatedFoundations({
      lastUpdatedAt: lastSyncConfig.stringValue,
      rnfIds: rnfs.map(r => r.idRnf),
    })
    for (const rnfId of modifiedRnfIds) {
      this.syncQueue.add(eJobName.SyncOneRnfOrganisme, {
        rnf: rnfId,
      } as SyncOneRnfOrganismeJobPayload)
    }
    await this.bnConfiguration.setConfig(eBnConfiguration.LAST_ORGANISM_SYNC_AT, (new Date()).toString())
    job.finished()
  }

  @Process(eJobName.SyncOneRnfOrganisme)
  async syncOneRnfOrganisme(
    job: Job<SyncOneRnfOrganismeJobPayload>,
  ): Promise<void> {
    this.logger.verbose('syncOneRnfOrganisme')
    await this.organismeService.upsertOrganismeRnf(job.data.rnf)
    job.finished()
  }

  @Process(eJobName.SyncOneRnaOrganisme)
  async syncOneRnaOrganisme(
    job: Job<SyncOneRnaOrganismeJobPayload>,
  ): Promise<void> {
    this.logger.verbose('syncOneRnaOrganisme')
    await this.organismeService.upsertOrganismeRna(job.data.rna)
    job.finished()
  }
}
