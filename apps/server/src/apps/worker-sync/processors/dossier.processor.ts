import { Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { JobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  SyncOneDossierPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DossierSynchroniseService } from '@/modules/dossiers/providers/synchronization/dossier-synchronise.service'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { DsApiClient } from '@dnum-mi/ds-api-client'

@Processor(QueueName.sync)
export class DossierProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly demarcheService: DemarcheService,
    private readonly dsApiClient: DsApiClient,
    private readonly dossierSynchroniseService: DossierSynchroniseService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Process(JobName.SyncOneDossier)
  async syncOneDemarche(job: Job<SyncOneDossierPayload>): Promise<void> {
    this.logger.verbose('sync one dossier')
    const demarche = await this.demarcheService.findOneById(job.data.demarcheId)
    const tdossier = await this.dsApiClient.dossierWithCustomChamp(job.data.dsDossierId)
    await this.dossierSynchroniseService.synchroniseOneDossier(tdossier.dossier, demarche)
    job.finished()
  }
}
