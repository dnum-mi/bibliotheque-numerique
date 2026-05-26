import { Inject, Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  DependencyPolicy,
} from '../infrastructure/dependency.types'
import { iDependencyCheckResult } from '@biblio-num/shared'
import { DependencyCheckService } from '@/modules/health/providers/depency-check.service'
import { HEALTH_DEPENDENCY_POLICY_SYMBOL } from '@/apps/apps.const'

@Injectable()
export class DependencySupervisorService {
  private readonly STARTUP_MAX_RETRIES = 10
  private readonly STARTUP_RETRY_DELAY = 5000

  private failureCounters = new Map<string, number>()

  constructor(
    private readonly logger: LoggerService,
    private checker: DependencyCheckService,
    @Inject(HEALTH_DEPENDENCY_POLICY_SYMBOL)
    private readonly policy: DependencyPolicy,
  ) {
    this.logger.setContext(this.constructor.name)
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

  //#region Helpers
  private async checkAll(): Promise<iDependencyCheckResult[]> {
    return Object.values(
      await this.checker.checkAll(),
    )
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  //#endregion
}
