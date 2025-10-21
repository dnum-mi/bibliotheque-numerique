import { Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  SyncAllDemarcheJobPayload,
  SyncOneDemarcheJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DemarcheSynchroniseService } from '@/modules/demarches/providers/services/demarche-synchronise.service'
import { ConfigService } from '@nestjs/config'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { AsyncLocalStorage } from 'async_hooks'
import { AsyncLocalStore } from '@/shared/modules/als/async-local-store.type'
import { Inject } from '@nestjs/common'
import { RedisService } from '@/shared/modules/redis/redis.service'
import { CustomBullService } from '@/shared/modules/custom-bull/custom-bull.service'
import { CustomBaseProcessor } from '@/shared/modules/custom-bull/custom-base.processor'

@Processor(QueueName.sync)
export class DemarcheProcessor extends CustomBaseProcessor {
  constructor(
    private readonly demarcheService: DemarcheService,
    private readonly demarcheSynchroniseService: DemarcheSynchroniseService,
    private readonly configService: ConfigService,
    private readonly customBullService: CustomBullService,
    protected redisService: RedisService,
    protected logger: LoggerService,
    @Inject(ALS_INSTANCE)
    private readonly als?: AsyncLocalStorage<AsyncLocalStore>,
  ) {
    super(redisService, logger)
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
      this.logger.log(`${demarcheIds?.length} to synchronize`)
      for (const id of demarcheIds) {
        this.logger.debug('Adding job to sync demarche ' + id)
        await this.customBullService.addSyncOneDemarcheJob({
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
      await this.demarcheSynchroniseService.synchroniseOneDemarche(
        job.data.demarcheId,
        job.data.fromScratch,
        job,
      )
    })
  }
}
