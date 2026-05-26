import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { RedisDependency } from '@/modules/health/infrastructure/dependencies/redis.dependency'
import { DsDependency } from '@/modules/health/infrastructure/dependencies/ds.dependency'
import { HubDependency } from '@/modules/health/infrastructure/dependencies/hub.dependency'
import { S3Dependency } from '@/modules/health/infrastructure/dependencies/s3.dependency'

import { DependencyName, iDependencyCheckResult } from '@biblio-num/shared'

@Injectable()
export class DependencyCheckService {
  constructor(
    private readonly logger: LoggerService,
    private readonly redis: RedisDependency,
    private readonly ds: DsDependency,
    private readonly hub: HubDependency,
    private readonly s3: S3Dependency,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async checkAll(): Promise<Record<DependencyName, iDependencyCheckResult>> {
    this.logger.verbose('checkAll')

    const results = await Promise.all([
      this.redis.check(),
      this.ds.check(),
      this.hub.check(),
      this.s3.check(),
    ])

    return Object.fromEntries(
      results.map((r) => [r.name as DependencyName, r]),
    ) as Record<DependencyName, iDependencyCheckResult>
  }
}
