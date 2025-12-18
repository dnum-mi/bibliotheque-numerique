import { Injectable } from '@nestjs/common'
import {
  QueueName,
  QueueNameKeys,
} from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { InjectQueue } from '@nestjs/bull'
import type { JobOptions, Queue } from 'bull'
import {
  eJobName,
  JobNameKey,
} from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  AnyJobPayload,
  SyncOneDemarcheJobPayload,
  SyncOneDossierJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { RedisService } from '@/shared/modules/redis/redis.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import { buildRedisKey, getKeyIdentifier } from './utils/bull-key.utils'

@Injectable()
export class CustomBullService {
  constructor(
    private readonly logger: LoggerService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
    @InjectQueue(QueueName.file) private readonly fileQueue: Queue,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private _getQueue(name: QueueNameKeys): Queue {
    return name === QueueName.sync ? this.syncQueue : this.fileQueue
  }

  private async _addJobWithLock({
    queueName,
    jobName,
    payload,
    opts = {},
  }: {
    queueName: QueueNameKeys
    jobName: JobNameKey
    payload: AnyJobPayload
    opts?: JobOptions
  }): Promise<boolean> {
    this.logger.verbose('_addJobWithLock')
    const key = getKeyIdentifier(jobName, payload)
    if (!key) {
      this.logger.debug(
        `The job ${jobName} does not require a lock. Direct addition.`,
      )
      await this._getQueue(QueueName.sync).add(jobName, payload, opts)
      return true
    }

    this.logger.debug(
      `queueName: ${queueName}, jobName: ${jobName}, key: ${key}, opts: ${opts}`,
    )

    const redisKey = buildRedisKey(jobName, key)
    const ttlSeconds = this.configService.get('bull').resyncMinutes * 60

    const lockAquired = await this.redisService.checkAndSet(
      redisKey,
      ttlSeconds,
    )
    if (!lockAquired) {
      this.logger.log(
        `A job for key ${key} is already in progress. Adding canceled.`,
      )
      return false
    }

    try {
      this.logger.debug(`Key set for ${redisKey}. Job added.`)
      await this._getQueue(queueName).add(jobName, payload, opts)
      return true
    } catch (error) {
      this.logger.error(`Failed to add job, the key ${redisKey} is removed.`)
      await this.redisService.deleteKey(redisKey)
      throw error
    }
  }

  public async addSyncOneDemarcheJob(
    payload: SyncOneDemarcheJobPayload,
  ): Promise<boolean> {
    return this._addJobWithLock({
      queueName: QueueName.sync,
      jobName: eJobName.SyncOneDemarche,
      payload,
    })
  }

  public async addSyncOneDossierJob(
    payload: SyncOneDossierJobPayload,
  ): Promise<boolean> {
    return this._addJobWithLock({
      queueName: QueueName.sync,
      jobName: eJobName.SyncOneDossier,
      payload,
    })
  }

  public async initkeys(): Promise<void> {
    this.logger.verbose('initkeys')
    const patternKeyDossier = buildRedisKey(
      eJobName.SyncOneDossier,
      'dossier:*',
    )
    const patternKeyDemarche = buildRedisKey(
      eJobName.SyncOneDemarche,
      'demarche:*',
    )
    await Promise.all([
      this.redisService.initkeys(patternKeyDossier),
      this.redisService.initkeys(patternKeyDemarche),
    ])
  }
}
