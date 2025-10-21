import { RedisService } from '@/shared/modules/redis/redis.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Job } from 'bull'
import { OnQueueCompleted, OnQueueFailed } from '@nestjs/bull'
import { buildRedisKey, getKeyIdentifier } from './utils/bull-key.utils'
import { JobNameKey } from './objects/const/job-name.enum'

export abstract class CustomBaseProcessor {
  protected constructor(
    protected readonly redisService: RedisService,
    protected readonly logger: LoggerService,
  ) {}

  @OnQueueCompleted()
  async OnCompleted(job: Job): Promise<void> {
    await this._releaseLock(job)
  }

  @OnQueueFailed()
  async OnFailed(job: Job): Promise<void> {
    await this._releaseLock(job)
  }

  private async _releaseLock(job: Job): Promise<void> {
    const jobName = job.name as JobNameKey
    const key = getKeyIdentifier(jobName, job.data)

    if (key) {
      const redisKey = buildRedisKey(jobName, key)
      this.logger.log(`Job ${job.id} completed. Lock ${redisKey} removed.`)
      await this.redisService.deleteKey(redisKey)
    }
  }
}
