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
import { RnaService } from '@/modules/organismes/providers/rna.service'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'

@Processor(QueueName.sync)
export class OrganismeProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly rnfService: RnfService,
    private readonly rnaService: RnaService,
    private readonly fieldService: FieldService,
    private readonly organismeService: OrganismeService,
    private readonly bnConfiguration: BnConfigurationService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Process(eJobName.SyncAllRnaOrganisme)
  async syncAllRnaOrganisme(): Promise<void> {
    // TODO: const rnas = await this.organismeService.getAllRnaOrganisme()
    // TODO: There is no way as of this time to have the last updated rna organisme from the rna api.
  }

  @Process(eJobName.SyncAllRnfOrganisme)
  async syncAllRnfOrganisme(): Promise<void> {
    this.logger.verbose('syncAllRnfOrganisme')
    const rnfs = await this.organismeService.getAllRnfOrganisme()
    const lastSyncConfig = await this.bnConfiguration.findByKeyName(
      eBnConfiguration.LAST_ORGANISM_SYNC_AT,
    )
    this.logger.log(`Synchronising all RNF since ${lastSyncConfig.stringValue}`)
    const query: { rnfIds: string[]; lastUpdatedAt?: string } = {
      rnfIds: rnfs.map((r) => r.idRnf),
    }
    if (lastSyncConfig.stringValue) {
      query.lastUpdatedAt = lastSyncConfig.stringValue
    }
    const modifiedRnfIds = await this.rnfService.getUpdatedFoundations(query)
    for (const rnfId of modifiedRnfIds) {
      this.syncQueue.add(eJobName.SyncOneRnfOrganisme, {
        rnf: rnfId,
      } satisfies SyncOneRnfOrganismeJobPayload)
    }
    await this.bnConfiguration.setConfig(
      eBnConfiguration.LAST_ORGANISM_SYNC_AT,
      new Date().toISOString(),
    )
  }

  @Process(eJobName.SyncOneRnfOrganisme)
  async syncOneRnfOrganisme(
    job: Job<SyncOneRnfOrganismeJobPayload>,
  ): Promise<void> {
    this.logger.verbose('syncOneRnfOrganisme')
    this.logger.debug(job.data)
    const rawRnf = await this.rnfService.getFoundation(job.data.rnf)
    if (rawRnf === null) {
      await this.organismeService.deleteOrganismeAndItsReferences({ idRnf: job.data.rnf })
      if (job.data.fieldId) {
        await this.fieldService.updateOrThrow(job.data.fieldId, {
          stringValue: `ERROR-${job.data.rnf}`,
        })
      }
    } else {
      await this.organismeService.updateOrganismeFromRnf(job.data.rnf, rawRnf)
    }
  }

  @Process(eJobName.SyncOneRnaOrganisme)
  async syncOneRnaOrganisme(
    job: Job<SyncOneRnaOrganismeJobPayload>,
  ): Promise<void> {
    this.logger.verbose('syncOneRnaOrganisme')
    const rawRna = await this.rnaService.getAssociation(job.data.rna)
    if (rawRna === null) {
      await this.organismeService.deleteOrganismeAndItsReferences({ idRna: job.data.rna })
      if (job.data.fieldId) {
        await this.fieldService.updateOrThrow(job.data.fieldId, {
          stringValue: `ERROR-${job.data.rna}`,
        })
      }
    } else {
      await this.organismeService.updateOrganismeFromRna(job.data.rna, rawRna)
    }
  }
}
