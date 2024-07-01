import { Injectable } from '@nestjs/common'
import {
  QueueName,
  QueueNameKeys,
} from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import {
  eJobName,
  JobNameKey,
} from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  AnyJobPayload,
  SyncOneRnaOrganismeJobPayload,
  SyncOneRnfOrganismeJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { RedisService } from '@/shared/modules/redis/redis.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'

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

  private _buildRedisKey(jobName: JobNameKey, key: string): string {
    return `${jobName}:${key}`
  }

  private async _addIfNotExists(
    queueName: QueueNameKeys,
    jobName: JobNameKey,
    key: string,
    payload: AnyJobPayload,
  ): Promise<void> {
    this.logger.verbose('_addIfNotExists')
    this.logger.debug(`queueName: ${queueName}, jobName: ${jobName}, key: ${key}`)
    const redisKey = this._buildRedisKey(jobName, key)
    const exist = await this.redisService.getKey(redisKey)
    if (!exist) {
      this.logger.debug('job doesnt exist, adding it to the queue')
      await this._getQueue(queueName).add(jobName, payload, {
        jobId: redisKey,
      })
      await this.redisService.checkAndSet(redisKey, this.configService.get('bull').resyncMinutes * 60)
    }
  }

  public async addSyncOneRnfOrganismeJob(
    payload: SyncOneRnfOrganismeJobPayload,
  ): Promise<void> {
    return this._addIfNotExists(
      QueueName.sync,
      eJobName.SyncOneRnfOrganisme,
      `rnf:${payload.rnf.toString()}`,
      payload,
    )
  }

  public async addSyncOneRnaOrganismeJob(
    payload: SyncOneRnaOrganismeJobPayload,
  ): Promise<void> {
    return this._addIfNotExists(
      QueueName.sync,
      eJobName.SyncOneRnaOrganisme,
      `rna:${payload.rna.toString()}`,
      payload,
    )
  }
}
