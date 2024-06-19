import { Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { SyncOneDossierJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DossierSynchroniseService } from '@/modules/dossiers/providers/synchronization/dossier-synchronise.service'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { DossierState, DsApiClient } from '@dnum-mi/ds-api-client'
import { AsyncLocalStorage } from 'async_hooks'
import { AsyncLocalStore } from '@/shared/modules/als/async-local-store.type'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { Inject } from '@nestjs/common'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { FindManyOptions, In, IsNull, LessThan, Not } from 'typeorm'
import { addMonths } from 'date-fns'
import { eAnonymisationEvent } from '@biblio-num/shared'
import { Dossier } from '../../../modules/dossiers/objects/entities/dossier.entity'

@Processor(QueueName.sync)
export class DossierProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly demarcheService: DemarcheService,
    private readonly dsApiClient: DsApiClient,
    private readonly dossierService: DossierService,
    private readonly dossierSynchroniseService: DossierSynchroniseService,
    @Inject(ALS_INSTANCE)
    private readonly als?: AsyncLocalStorage<AsyncLocalStore>,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Process(eJobName.SyncOneDossier)
  async syncOneDossier(job: Job<SyncOneDossierJobPayload>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.log('sync one dossier')
      const demarche = await this.demarcheService.findOneById(
        job.data.demarcheId,
      )
      const tdossier = await this.dsApiClient.dossierWithCustomChamp(
        job.data.dsDossierId,
      )
      await this.dossierSynchroniseService.synchroniseOneDossier(
        tdossier.dossier,
        demarche,
      )
    })
  }

  @Process(eJobName.AnonymizeDossiers)
  async anonymiseDossiers(job: Job): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.log('anonymise dossiers')
      const demarches = await this.demarcheService.repository.find({
        where: { nbrMonthAnonymisation: Not(IsNull()) },
      })
      job.progress(10)
      this.logger.debug(
        `${demarches.length} demarches with anonymisation found`,
      )
      const oneDemarcheStep = 90 / demarches.length
      const now = new Date()
      for (const demarche of demarches) {
        const limitDate = addMonths(now, -demarche.nbrMonthAnonymisation)
        const whereQuery: FindManyOptions<Dossier>['where'] = {}
        switch (demarche.anonymizationEvent) {
        case eAnonymisationEvent.DepotDate:
          whereQuery.dateDepot = LessThan(limitDate)
          break
        case eAnonymisationEvent.AcceptedDate:
          whereQuery.dateTraitement = LessThan(limitDate)
          whereQuery.state = DossierState.Accepte
          break
        case eAnonymisationEvent.DecisionDate:
          whereQuery.dateTraitement = LessThan(limitDate)
          whereQuery.state = In([DossierState.Accepte, DossierState.Refuse, DossierState.SansSuite])
          break
        default:
          this.logger.warn(`unknown event (${
            demarche.anonymizationEvent}) to anonymise demarche ${demarche.dsDataJson.number}`)
          continue
        }

        let dossiers = await this.dossierService.repository.find({
          where: {
            anonymisedAt: null,
            demarcheId: demarche.id,
            ...whereQuery,
          },
          select: ['id', 'dsDataJson'],
        })

        if (demarche.isOnAllDossiersOfOrganisme) {
          const dossiersOfOrg = await this.dossierService.repository.find({
            where: {
              anonymisedAt: null,
              demarcheId: In(demarches.map(d => d.id)),
              organisme: { id: In([...new Set(dossiers.map(d => d.organisme.id))]) },
            },

            select: ['id', 'dsDataJson'],
          })
          dossiers = dossiers.concat(dossiersOfOrg)
        }

        const dossierStep = oneDemarcheStep / dossiers.length
        for (const dossier of dossiers) {
          await this.dossierService.anonymiseDossierDemandeur(dossier)

          job.progress(job.progress() + dossierStep)
        }
      }
    })
  }
}
