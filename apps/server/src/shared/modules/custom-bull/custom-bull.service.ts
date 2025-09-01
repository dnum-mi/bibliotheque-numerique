import { Injectable } from '@nestjs/common'
import {
  QueueName,
  QueueNameKeys,
} from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import {
  InjectQueue,
  OnGlobalQueueError,
  OnGlobalQueueFailed,
  Processor,
} from '@nestjs/bull'
import { Job, Queue } from 'bull'
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
@Processor(QueueName.file)
@Processor(QueueName.sync)
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

  @OnGlobalQueueError()
  handlerQueueError(error: Error): void {
    this.logger.error(error)
  }

  @OnGlobalQueueFailed()
  async handleQueueFailed(jobId: number, errorMessage: string): Promise<void> {
    const job: Job = await this.syncQueue.getJob(jobId) ?? await this.fileQueue.getJob(jobId)
    this.logger.error(new Error(`Job ${job?.name} (id:${job?.id || jobId}) with error: ${errorMessage}.`))
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
  ): Promise<boolean> {
    this.logger.verbose('_addIfNotExists')
    this.logger.debug(`queueName: ${queueName}, jobName: ${jobName}, key: ${key}`)
    const redisKey = this._buildRedisKey(jobName, key)
    const exist = await this.redisService.getKey(redisKey)
    this.logger.debug(exist)
    if (!exist) {
      this.logger.debug('job doesnt exist, adding it to the queue')
      await this._getQueue(queueName).add(jobName, payload)
      await this.redisService.checkAndSet(redisKey, this.configService.get('bull').resyncMinutes * 60)
      return true
    }
    return false
  }

  public async addSyncOneRnfOrganismeJob(
    payload: SyncOneRnfOrganismeJobPayload,
  ): Promise<boolean> {
    return this._addIfNotExists(
      QueueName.sync,
      eJobName.SyncOneRnfOrganisme,
      `rnf:${payload.rnf.toString()}`,
      payload,
    )
  }

  public async addSyncOneRnaOrganismeJob(
    payload: SyncOneRnaOrganismeJobPayload,
  ): Promise<boolean> {
    return this._addIfNotExists(
      QueueName.sync,
      eJobName.SyncOneRnaOrganisme,
      `rna:${payload.rna.toString()}`,
      payload,
    )
  }

  public async initkeys(): Promise<void> {
    this.logger.verbose('initkeys')
    const patternKeyRnf = this._buildRedisKey(eJobName.SyncOneRnfOrganisme, 'rnf:*')
    const patternKeyRna = this._buildRedisKey(eJobName.SyncOneRnaOrganisme, 'rna:*')
    await Promise.all([
      this.redisService.initkeys(patternKeyRnf),
      this.redisService.initkeys(patternKeyRna),
    ])
  }
}
