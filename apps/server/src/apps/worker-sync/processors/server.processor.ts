import { Process, Processor } from '@nestjs/bull'
import { Inject } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { AsyncLocalStore } from '@/shared/modules/als/async-local-store.type'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { RefreshTokenService } from '@/modules/refresh-token/refreshToken.service'
import { eJobName } from '../../../shared/modules/custom-bull/objects/const/job-name.enum'
import { Job } from 'bull'

@Processor(QueueName.sync)
export class ServerProcessor {
  constructor(
    private readonly logger: LoggerService,
    private refreshTokenService: RefreshTokenService,
    @Inject(ALS_INSTANCE) private readonly als?: AsyncLocalStorage<AsyncLocalStore>,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Process(eJobName.CleanDb)
  async CleanDb(job: Job<never>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('CleanDb')
      await this.refreshTokenService.deleteRefreshTokenExpiered()
    })
  }
}
