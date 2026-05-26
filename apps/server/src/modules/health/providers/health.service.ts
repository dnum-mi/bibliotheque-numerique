import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Repository } from 'typeorm'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { HealthSnapshot } from '../objects/health-snapshot.entity'
import * as versionJson from '../../../version.json'
import { EnvTextKeys, iHealthOutput } from '@biblio-num/shared'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { DependencyCheckService } from '@/modules/health/providers/depency-check.service'
import { APP_NAME_SYMBOL } from '@/apps/apps.const'

@Injectable()
export class HealthService extends BaseEntityService<HealthSnapshot> {
  constructor(
    protected readonly logger: LoggerService,
    private readonly config: ConfigService,
    @Inject(APP_NAME_SYMBOL) private readonly appName: string,
    private readonly checker: DependencyCheckService,
    @InjectRepository(HealthSnapshot)
    protected readonly repo: Repository<HealthSnapshot>,
  ) {
    super(repo, logger)

    this.logger.setContext(this.constructor.name)
  }

  async readiness(): Promise<iHealthOutput> {
    this.logger.verbose('readiness')

    const dependenciesHash = await this.checker.checkAll()
    const isEverythingOk = Object.values(dependenciesHash).every(
      (r) => r.status === 'up',
    )

    await this.createAndSave({
      isEverythingOk,
      dependenciesHash,
      appName: this.appName,
    })

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
      order: {
        createdAt: 'DESC',
      },
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
