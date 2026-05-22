import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Repository } from 'typeorm'

import { LoggerService } from '@/shared/modules/logger/logger.service'

import { RedisDependency } from '@/modules/health/infrastructure/dependencies/redis.dependency'
import { DsDependency } from '@/modules/health/infrastructure/dependencies/ds.dependency'
import { HubDependency } from '@/modules/health/infrastructure/dependencies/hub.dependency'
import { S3Dependency } from '@/modules/health/infrastructure/dependencies/s3.dependency'
import { HealthSnapshot } from '../objects/health-snapshot.entity'
import * as versionJson from '../../../version.json'

import {
  DependencyName,
  EnvTextKeys,
  iDependencyCheckResult,
  iHealthOutput,
} from '@biblio-num/shared'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'

@Injectable()
export class HealthService extends BaseEntityService<HealthSnapshot> {
  constructor(
    protected readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly redis: RedisDependency,
    private readonly ds: DsDependency,
    private readonly hub: HubDependency,
    private readonly s3: S3Dependency,
    @InjectRepository(HealthSnapshot)
    protected readonly repo: Repository<HealthSnapshot>,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async readiness(): Promise<iHealthOutput> {
    this.logger.verbose('readiness')
    const results = await Promise.all([
      this.redis.check(),
      this.ds.check(),
      this.hub.check(),
      this.s3.check(),
    ])
    const dependenciesHash = Object.fromEntries(
      results.map((r) => [r.name as DependencyName, r]),
    ) as Record<DependencyName, iDependencyCheckResult>
    const isEverythingOk = results.every((r) => r.status === 'up')

    await this.createAndSave({ isEverythingOk, dependenciesHash })

    if (isEverythingOk) {
      this.logger.log('All services are online and well ✅')
    } else {
      this.logger.warn('Some dependencies are down ❌')
    }

    return {
      status: isEverythingOk ? 'ok' : 'degraded',
      timestamp: new Date(),
      dependenciesHash,
      info: {
        version: versionJson.version,
        environment: this.config.get('runEnv') as EnvTextKeys,
      },
    } as iHealthOutput
  }

  async lastHealthSnapshot(): Promise<iHealthOutput | null> {
    const last = await this.repo.findOne({
      where: {},
      order: { createdAt: -1 },
    })

    if (!last) {
      return null
    }

    return {
      status: last.isEverythingOk ? 'up' : 'degraded',
      timestamp: last.createdAt,
      dependenciesHash: last.dependenciesHash,
      info: {
        version: versionJson.version,
        environment: this.config.get('runEnv') as EnvTextKeys,
      },
    }
  }
}
