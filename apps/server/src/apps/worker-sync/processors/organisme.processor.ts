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
import { eBnConfiguration, IRnfOutput } from '@biblio-num/shared'
import { RnaService } from '@/modules/organismes/providers/rna.service'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { AsyncLocalStorage } from 'async_hooks'
import { AsyncLocalStore } from '@/shared/modules/als/async-local-store.type'
import { Inject } from '@nestjs/common'
import { differenceInMonths, isAfter } from 'date-fns'

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
    @Inject(ALS_INSTANCE)
    private readonly als?: AsyncLocalStorage<AsyncLocalStore>,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Process(eJobName.ComputeOrganismeDDC)
  async computeOrganismeDDC(job: Job<never>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('computeOrganismeDDC')
      const currentYear = new Date().getFullYear()
      const middleYear = new Date(`${currentYear}-06-01`)
      const computingYear = isAfter(new Date(), middleYear) ? currentYear : currentYear - 1
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
      const __oneMoreStep = ():void => {
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
        if (differenceInMonths(new Date(), fiscalEndDateComputingYear) >= nbrMonth) {
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

  @Process(eJobName.SyncAllRnaOrganisme)
  async syncAllRnaOrganisme(job: Job<never>): Promise<void> {
    // TODO: const rnas = await this.organismeService.getAllRnaOrganisme()
    // TODO: There is no way as of this time to have the last updated rna organisme from the rna api.
    await this.als.run({ job }, async () => {})
  }

  @Process(eJobName.SyncAllRnfOrganisme)
  async syncAllRnfOrganisme(job: Job<never>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('syncAllRnfOrganisme')
      const enbleRnfSiaf = await this.bnConfiguration.getValueByKeyName(eBnConfiguration.ENABLE_RNF_SIAF)
      const rnfs = await this.organismeService.getAllRnfOrganisme()
      const lastSyncConfig = await this.bnConfiguration.findByKeyName(
        eBnConfiguration.LAST_ORGANISM_SYNC_AT,
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

      const modifiedRnfIds = await this.rnfService.getUpdatedFoundations(query, enbleRnfSiaf as boolean)
      for (const rnfId of modifiedRnfIds) {
        this.syncQueue.add(eJobName.SyncOneRnfOrganisme, {
          rnf: rnfId,
        } satisfies SyncOneRnfOrganismeJobPayload)
      }
      await this.bnConfiguration.setConfig(
        eBnConfiguration.LAST_ORGANISM_SYNC_AT,
        new Date().toISOString(),
      )
    })
  }

  @Process(eJobName.SyncOneRnfOrganisme)
  async syncOneRnfOrganisme(
    job: Job<SyncOneRnfOrganismeJobPayload>,
  ): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('syncOneRnfOrganisme')
      this.logger.debug(job.data)
      const enbleRnfSiaf = await this.bnConfiguration.getValueByKeyName(eBnConfiguration.ENABLE_RNF_SIAF)
      const rawRnf = await this.rnfService.getFoundation(job.data.rnf, enbleRnfSiaf as boolean)

      if (rawRnf === null) {
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

        await this.organismeService.updateOrganismeFromRnf(
          job.data.rnf,
            rawRnf as IRnfOutput,
            job.data.firstTime,
            enbleRnfSiaf as boolean,
        )
      }
    })
  }

  @Process(eJobName.SyncOneRnaOrganisme)
  async syncOneRnaOrganisme(
    job: Job<SyncOneRnaOrganismeJobPayload>,
  ): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('syncOneRnaOrganisme')
      const rawRna = await this.rnaService.getAssociation(job.data.rna)
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
        await this.organismeService.updateOrganismeFromRna(job.data.rna, rawRna)
        job.log('Updated Organisme from rna')
        job.progress(60)
        await this.organismeService.synchroniseRnaFiles(job.data.rna, rawRna)
        job.log('Rna files job created')
      }
      job.progress(100)
    })
  }
}
