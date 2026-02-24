import {
  InjectQueue,
  Process,
  Processor,
} from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  AnonymiseOneDemarcheJobPayload,
  AnonymiseOneDossierJobPayload,
  DeleteS3FilesJobPayload, RebuildProjectionTablesPayload,
  SyncOneDossierJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job, Queue } from 'bull'
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
import { anonymisedFileValue, eAnonymisationEvent } from '@biblio-num/shared'
import { Dossier } from '../../../modules/dossiers/objects/entities/dossier.entity'
import { RedisService } from '@/shared/modules/redis/redis.service'
import { CustomBaseProcessor } from '@/shared/modules/custom-bull/custom-base.processor'
import {
  DemarcheAnonymisedInformationPayloadDto,
  demarcheAnonymisedInformationPayloadDtoKeys,
} from '@/modules/demarches/objects/dtos/demarch-anonymised-information-payload.dto'

@Processor(QueueName.sync)
export class DossierProcessor extends CustomBaseProcessor {
  constructor(
    private readonly demarcheService: DemarcheService,
    private readonly dsApiClient: DsApiClient,
    private readonly dossierService: DossierService,
    private readonly dossierSynchroniseService: DossierSynchroniseService,
    protected redisService: RedisService,
    protected logger: LoggerService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
    @InjectQueue(QueueName.file) private readonly fileQueue: Queue,
    @Inject(ALS_INSTANCE)
    private readonly als?: AsyncLocalStorage<AsyncLocalStore>,
  ) {
    super(redisService, logger)
    this.logger.setContext(this.constructor.name)
  }

  @Process(eJobName.SyncOneDossier)
  async syncOneDossier(job: Job<SyncOneDossierJobPayload>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.log(
        `Sync one dossier (dossier:${job.data.dsDossierId}) (demarche:${job.data.demarcheId})`,
      )
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

  @Process(eJobName.FixOrganismeDossier)
  async fixOrganismeDossiers(
    job: Job<{ dossierId: number }>,
  ): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.log(
        `fixOrganismeDossiers for dossier: ${job.data.dossierId}`,
      )
      await this.dossierSynchroniseService.addTitleOrganismeInFieldsByIDossier(job.data.dossierId)
    })
  }

  //#region 📍------ ANONYMISED ------ 📍
  @Process(eJobName.AnonymiseAll)
  async anonymiseAll(job: Job<never>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.log('anonymise all')
      const demarches: DemarcheAnonymisedInformationPayloadDto[] = await this.demarcheService.repository.find({
        select: demarcheAnonymisedInformationPayloadDtoKeys,
        where: {
          nbrMonthAnonymisation: Not(IsNull()),
          anonymizationEvent: Not(IsNull()),
        },
      })
      job.progress(10)
      this.logger.debug(
        `${demarches.length} demarches with anonymisation found`,
      )
      const oneDemarcheStep = 90 / demarches.length
      for (const demarche of demarches) {
        await this.syncQueue.add(eJobName.AnonymiseOneDemarche, {
          demarche,
        } as AnonymiseOneDemarcheJobPayload)
        job.progress(job.progress() + oneDemarcheStep)
      }
      job.progress(100)
    })
  }

  @Process(eJobName.AnonymiseOneDemarche)
  async anonymiseOneDemarche(
    job: Job<AnonymiseOneDemarcheJobPayload>,
  ): Promise<void> {
    await this.als.run({ job }, async () => {
      const demarche = job.data.demarche
      this.logger.log('anonymise one demarche: ' + demarche.id)
      const limitDate = addMonths(new Date(), -demarche.nbrMonthAnonymisation)
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
          whereQuery.state = In([
            DossierState.Accepte,
            DossierState.Refuse,
            DossierState.SansSuite,
          ])
          break
        default:
          this.logger.warn(
            `unknown event (${demarche.anonymizationEvent}) to anonymise demarche ${demarche.dsId}`,
          )
          return
      }
      const dossierIds: {id: number}[] = await this.dossierService.repository.find({
        where: {
          anonymisedAt: null,
          demarcheId: demarche.id,
          ...whereQuery,
        },
        select: ['id'],
      })

      const dossierStep = 100 / dossierIds.length
      for (const dossier of dossierIds) {
        await this.syncQueue.add(eJobName.AnonymiseOneDossier, {
          dossierId: dossier.id,
          demarche,
          priority: 1,
        } as AnonymiseOneDossierJobPayload)

        job.progress(job.progress() + dossierStep)
      }

      await this.syncQueue.add(eJobName.RebuildProjectionTables, {
        demarcheId: demarche.id,
        priority: 100, // we want to be sure it happens AFTER all dossier have been anonymised
      } as RebuildProjectionTablesPayload)

      job.progress(100)
    })
  }

  @Process(eJobName.AnonymiseOneDossier)
  async anonymiseOneDossier(
    job: Job<AnonymiseOneDossierJobPayload>,
  ): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.log('anonymise one dossier: ' + job.data.dossierId)
      const dossier = await this.dossierService.findOneById(job.data.dossierId, { files: true })
      await this.dossierService.anonymiseDossier(
        dossier,
        job.data.demarche.mappingAnonymized,
      )
      job.progress(50)
      const fileUuids: string[] = dossier.files
        .filter(f => f.label === anonymisedFileValue)
        .map(f => f.uuid)
      if (fileUuids.length) {
        await this.fileQueue.add(eJobName.DeleteS3Files, {
          fileUuids,
        } as DeleteS3FilesJobPayload)
      }
      job.progress(100)
    })
  }

  //#endregion
}
