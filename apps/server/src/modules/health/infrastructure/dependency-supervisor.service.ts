import { Inject, Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  DependencyChecker,
  DependencyCheckResult,
  DependencyPolicy,
} from './dependency.types'
import {
  HEALTH_DEPENDENCY_POLICY,
} from './dependency.symbols'
import { DsDependency } from '@/modules/health/infrastructure/dependencies/ds.dependency'
import { HubDependency } from '@/modules/health/infrastructure/dependencies/hub.dependency'
import { S3Dependency } from '@/modules/health/infrastructure/dependencies/s3.dependency'
import { RedisDependency } from '@/modules/health/infrastructure/dependencies/redis.dependency'

@Injectable()
export class DependencySupervisorService {
  private readonly STARTUP_MAX_RETRIES = 10
  private readonly STARTUP_RETRY_DELAY = 5000
  private readonly MONITOR_INTERVAL = 10000
  private readonly MONITOR_MAX_FAILURES = 5

  private failureCounters = new Map<string, number>()

  constructor(
    private readonly logger: LoggerService,
    private readonly redis: RedisDependency,
    private readonly ds: DsDependency,
    private readonly hub: HubDependency,
    private readonly s3: S3Dependency,
    @Inject(HEALTH_DEPENDENCY_POLICY)
    private readonly policy: DependencyPolicy,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private _getDependencies(): DependencyChecker[] {
    return [
      this.redis,
      this.ds,
      this.hub,
      this.s3,
    ]
  }

  //#region Startup phase

  async waitUntilReady(): Promise<void> {
    this.logger.log('📋 Checking critical dependencies before startup')

    for (let attempt = 1; attempt <= this.STARTUP_MAX_RETRIES; attempt++) {
      const results = await this.checkAll()

      const failedCritical = results.filter(
        (r) => r.status === 'down' && this.policy[r.name]?.critical === true,
      )

      if (failedCritical.length === 0) {
        this.logger.log('🚀 All critical dependencies are ready.')
        return
      }

      const names = failedCritical.map((d) => d.name).join(', ')

      this.logger.error(
        `Critical dependencies not ready (${names}) attempt ${attempt}/${this.STARTUP_MAX_RETRIES}`,
      )

      await this.sleep(this.STARTUP_RETRY_DELAY)
    }

    this.logger.error(
      'Critical dependencies unavailable after retries. Shutting down.',
    )
    process.exit(1)
  }

  //#endregion

  //#region Monitoring phase
  startMonitoring(): void {
    this.logger.log('🩺 Starting dependency monitoring')
    setInterval(() => this.monitor(), this.MONITOR_INTERVAL)
  }

  private async monitor(): Promise<void> {
    this.logger.verbose('monitor')
    const results = await this.checkAll()

    for (const result of results) {
      this.logger.debug(result)
      const isCritical = this.policy[result.name]?.critical === true

      if (result.status === 'up') {
        this.failureCounters.set(result.name, 0)
        continue
      }

      if (!isCritical) {
        this.logger.warn(`Non-critical dependency down: ${result.name}`)
        continue
      }

      const failures = (this.failureCounters.get(result.name) ?? 0) + 1
      this.failureCounters.set(result.name, failures)

      this.logger.warn(`Critical dependency ${result.name} down (${failures}/${this.MONITOR_MAX_FAILURES})`)

      if (failures >= this.MONITOR_MAX_FAILURES) {
        this.logger.error(`Critical dependency ${result.name} unavailable. Worker shutting down.`)
        process.exit(1)
      }
    }
  }
  //#endregion

  //#region Helpers
  private async checkAll(): Promise<DependencyCheckResult[]> {
    return Promise.all(
      this._getDependencies().map((dep) => dep.check()),
    )
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  //#endregion
}
