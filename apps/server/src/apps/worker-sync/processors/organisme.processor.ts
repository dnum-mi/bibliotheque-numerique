import { Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  SyncOneRnaOrganismeJobPayload,
  SyncOneRnfOrganismeJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { BnConfigurationService } from '@/shared/modules/bn-configurations/providers/bn-configuration.service'
import {
  eBnConfiguration,
  IRnaOutput,
  IAssociationOutput,
  IFoundationOutput,
} from '@biblio-num/shared'
import { RnaService } from '@/modules/organismes/providers/rna.service'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { AsyncLocalStorage } from 'async_hooks'
import { AsyncLocalStore } from '@/shared/modules/als/async-local-store.type'
import { Inject } from '@nestjs/common'
import { differenceInMonths, isAfter } from 'date-fns'
import { OrganismeSyncStateService } from '@/modules/organismes/providers/organisme-sync-state.service'
import { OrganismeSyncService } from '@/modules/organismes/providers/organisme-sync.service'
import { OrganismeRnaService } from '@/modules/organismes/providers/organisme-rna.service'
import { IGetUpdateAssociationInputDto } from '@/modules/organismes/objects/dto/get-updated-association-input.dto'
import { eFileStorageIn } from '../../../modules/files/objects/const/file-storage-in.enum'
import { RedisService } from '@/shared/modules/redis/redis.service'
import { CustomBaseProcessor } from '@/shared/modules/custom-bull/custom-base.processor'

@Processor(QueueName.sync)
export class OrganismeProcessor extends CustomBaseProcessor {
  constructor(
    private readonly rnaService: RnaService,
    private readonly fieldService: FieldService,
    private readonly organismeService: OrganismeService,
    private readonly bnConfiguration: BnConfigurationService,
    private readonly syncState: OrganismeSyncStateService,
    private readonly organismeSyncService: OrganismeSyncService,
    private readonly organismeRnaService: OrganismeRnaService,
    protected redisService: RedisService,
    protected logger: LoggerService,
    @Inject(ALS_INSTANCE)
    private readonly als?: AsyncLocalStorage<AsyncLocalStore>,
  ) {
    super(redisService, logger)
    this.logger.setContext(this.constructor.name)
  }

  @Process(eJobName.ComputeOrganismeDDC)
  async computeOrganismeDDC(job: Job<never>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('computeOrganismeDDC')
      const currentYear = new Date().getFullYear()
      const middleYear = new Date(`${currentYear}-06-01`)
      const computingYear = isAfter(new Date(), middleYear)
        ? currentYear
        : currentYear - 1
      this.logger.log('Computing year: ' + computingYear)
      const nbrMonth = await this.bnConfiguration
        .findByKeyName(eBnConfiguration.DDC_MONTH_BEFORE_MISSING)
        .then((c) => parseInt(c.stringValue, 10))
      job.progress(5)
      const orgs =
        await this.organismeService.getAllOrganismeWithoutYear(computingYear)
      this.logger.log('Organisme without computing year: ' + orgs.length)
      if (!orgs.length) {
        job.finished()
        return
      }
      job.progress(10)
      let progress = 10
      const step = 90 / orgs.length
      const __oneMoreStep = (): void => {
        progress += step
        job.progress(progress)
        if (progress >= 99) {
          job.finished()
        }
      }
      orgs.forEach((o) => {
        const fiscalEndDateComputingYear = o.fiscalEndDateAt
        if (!fiscalEndDateComputingYear) {
          __oneMoreStep()
          return
        }
        fiscalEndDateComputingYear.setFullYear(computingYear)
        if (
          differenceInMonths(new Date(), fiscalEndDateComputingYear) >= nbrMonth
        ) {
          this.logger.log('adding missing year to organisme with id ' + o.id)
          this.organismeService.repository
            .update(
              { id: o.id },
              {
                missingDeclarationYears: [
                  ...o.missingDeclarationYears,
                  computingYear,
                ],
              },
            )
            .then(__oneMoreStep)
        } else {
          this.logger.debug('No missing year for organisme with id ' + o.id)
          __oneMoreStep()
        }
      })
    })
  }

  // #region synchronization RNA
  @Process(eJobName.SyncAllRnaOrganisme)
  async syncAllRnaOrganisme(job: Job<never>): Promise<void> {
    // TODO: const rnas = await this.organismeService.getAllRnaOrganisme()
    // TODO: There is no way as of this time to have the last updated rna organisme from the rna api.
    await this.als.run({ job }, async () => {
      this.logger.verbose('syncAllRnaOrganisme')

      const isSyncRnaViaHub = await this.bnConfiguration.getValueByKeyName(
        eBnConfiguration.SYNC_RNA_VIA_HUB,
      )

      if (!isSyncRnaViaHub) {
        this.logger.warn('Sync hub is not actived')
        return
      }

      const lastSyncConfig = await this.bnConfiguration.findByKeyName(
        eBnConfiguration.LAST_ORGANISM_SYNC_AT,
      )

      const rnas = await this.organismeService.getAllRnaOrganisme()
      const query: IGetUpdateAssociationInputDto = {
        ids: rnas.map((r) => r.idRna),
      }
      if (lastSyncConfig.stringValue) {
        query.lastUpdatedAt = lastSyncConfig.stringValue
      }
      const modifiedRnaIds =
        await this.organismeRnaService.getLastUpdated(query)

      const dateNow = new Date().toISOString()
      const addJobsResults = await Promise.allSettled(
        modifiedRnaIds.map(async (rnfId) => {
          return this.organismeSyncService.addSyncOneRna(rnfId)
        }),
      )

      const rejectedCount = addJobsResults.filter(
        (result) => result.status === 'rejected',
      )
      this.logger.debug(`Add jobs sync organismes rna: ${addJobsResults}`)
      if (rejectedCount) {
        this.logger.warn(
          `Failed to add ${rejectedCount} jobs to sync organismes rna`,
        )
      }

      await this.bnConfiguration.setConfig(
        eBnConfiguration.LAST_ORGANISM_SYNC_AT,
        dateNow,
      )
    })
  }

  @Process(eJobName.SyncOneRnaOrganisme)
  async syncOneRnaOrganisme(
    job: Job<SyncOneRnaOrganismeJobPayload>,
  ): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('syncOneRnaOrganisme')
      try {
        const isSyncRnaViaHub = await this.bnConfiguration.getValueByKeyName(
          eBnConfiguration.SYNC_RNA_VIA_HUB,
        )

        await this.syncState.setStateUploadingByIdRna(
          job.data.rna,
          job.data.syncState,
        )
        let rawRna: IAssociationOutput | IRnaOutput
        if (isSyncRnaViaHub) {
          rawRna = await this.organismeService.getAssocationFromHub(
            job.data.rna,
          )
        } else {
          rawRna = await this.rnaService.getAssociation(job.data.rna)
        }

        job.progress(50)
        job.log('Association retrieved from rna')
        job.log(JSON.stringify(rawRna))
        if (rawRna === null) {
          job.log('RnaId is null, deleting reference in database')
          await this.organismeService.repository.delete({ idRna: job.data.rna })
          job.progress(75)
          if (job.data.fieldId) {
            job.log('Putting field rna to ERROR-RNA')
            await this.fieldService.updateOrThrow(job.data.fieldId, {
              stringValue: `ERROR-${job.data.rna}`,
            })
          }
        } else {
          if (job.data.fieldId) {
            await this.fieldService.updateOrThrow(job.data.fieldId, {
              stringValue: `${job.data.rna}`,
            })
          }
          if (isSyncRnaViaHub) {
            // Clean Data
            await this.organismeRnaService.deleteFiles(
              job.data.rna,
              eFileStorageIn.S3,
            )
            // Update RNA
            await this.organismeService.updateOrganismeRnaFromHub(
              rawRna as IAssociationOutput,
            )
            job.log('Updated Organisme from rna')
            job.progress(60)
            await this.organismeService.synchroniseRnaFilesFromHub(
              rawRna as IAssociationOutput,
            )
            job.log('Rna files job created')
          } else {
            // Clean Data
            await this.organismeRnaService.deleteFiles(
              job.data.rna,
              eFileStorageIn.HUB,
            )
            // Update RNA
            await this.organismeService.updateOrganismeFromRna(
              job.data.rna,
              rawRna as IRnaOutput,
            )
            job.log('Updated Organisme from rna')
            job.progress(60)
            await this.organismeService.synchroniseRnaFiles(
              job.data.rna,
              rawRna as IRnaOutput,
            )
            job.log('Rna files job created')
          }
        }
        job.progress(100)
        await this.syncState.setStateUploadedByRnaId(job.data.rna)
      } catch (e) {
        await this.syncState.setStateFailedByRnaId(
          job.data.rna,
          e.message,
          job.data.syncState,
        )
        throw e
      }
    })
  }
  // #endregion synchronization RNA

  // #region synchronization RNF
  @Process(eJobName.SyncAllRnfOrganisme)
  async syncAllRnfOrganisme(job: Job<never>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('syncAllRnfOrganisme')
      const rnfs = await this.organismeService.getAllRnfOrganisme()
      const lastSyncConfig = await this.bnConfiguration.findByKeyName(
        eBnConfiguration.LAST_FOUNDATION_SYNC_AT,
      )

      this.logger.log(
        `Synchronising all RNF since ${lastSyncConfig.stringValue}`,
      )
      const query: { rnfIds: string[]; lastUpdatedAt?: string } = {
        rnfIds: rnfs.map((r) => r.idRnf),
      }
      if (lastSyncConfig.stringValue) {
        query.lastUpdatedAt = lastSyncConfig.stringValue
      }

      const dateNow = new Date().toISOString()
      const modifiedRnfIds: string[] = await this.organismeService.getLastUpdatedFoundations(query)

      const addJobsResults = await Promise.allSettled(
        modifiedRnfIds.map(async (rnfId) => {
          return this.organismeSyncService.addSyncOneRnf(rnfId)
        }),
      )

      const rejectedCount = addJobsResults.filter(
        (result) => result.status === 'rejected',
      )
      this.logger.debug(`Add jobs sync organismes rnf: ${addJobsResults}`)
      if (rejectedCount) {
        this.logger.warn(
          `Failed to add ${rejectedCount} jobs to sync organismes rnf`,
        )
      }

      await this.bnConfiguration.setConfig(
        eBnConfiguration.LAST_FOUNDATION_SYNC_AT,
        dateNow,
      )
    })
  }

  @Process(eJobName.SyncOneRnfOrganisme)
  async syncOneRnfOrganisme(
    job: Job<SyncOneRnfOrganismeJobPayload>,
  ): Promise<void> {
    await this.als.run({ job }, async () => {
      try {
        this.logger.verbose('syncOneRnfOrganisme')
        this.logger.debug(job.data)
        await this.syncState.setStateUploadingByIdRnf(
          job.data.rnf,
          job.data.syncState,
        )

        const rawRnf: IFoundationOutput = await this.organismeService.getFoundationFromHub(
          job.data.rnf,
        )

        if (rawRnf === null) {
          this.logger.warn(
            `The foundation ${job.data.rnf} is not found. The foundation is deleting`,
          )
          await this.organismeService.repository.delete({ idRnf: job.data.rnf })
          if (job.data.fieldId) {
            await this.fieldService.updateOrThrow(job.data.fieldId, {
              stringValue: `ERROR-${job.data.rnf}`,
            })
          }
        } else {
          if (job.data.fieldId) {
            await this.fieldService.updateOrThrow(job.data.fieldId, {
              stringValue: `${job.data.rnf}`,
            })
          }

          // UPDATE Rnf
          await this.organismeService.updateOrganismeFromRnf(
            job.data.rnf,
            rawRnf,
            job.data.firstTime,
          )

          await this.organismeService.synchroniseRnfFiles(
            job.data.rnf,
            rawRnf,
          )
        }
        await this.syncState.setStateUploadedByRnfId(job.data.rnf)
      } catch (e) {
        await this.syncState.setStateFailedByRnfId(
          job.data.rnf,
          e.message,
          job.data.syncState,
        )
        throw e
      }
    })
  }
  //#endregion synchronization RNF
}
