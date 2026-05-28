import { Injectable, OnModuleInit } from '@nestjs/common'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import { SchedulerRegistry } from '@nestjs/schedule'
import { HealthService } from './health.service'

@Injectable()
export class HealthCronService implements OnModuleInit {
  constructor(
      protected readonly logger: LoggerService,
      private readonly configService: ConfigService,
      private schedulerRegistry: SchedulerRegistry,
      private healthService: HealthService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private isRunningHealthCheck = false
  // @Interval(10000)
  async checkHealthPeriodically(): Promise<void> {
    if (this.isRunningHealthCheck) {
      this.logger.warn('Previous health check is still running, skipping this interval')
      return
    }
    this.isRunningHealthCheck = true
    try {
      await this.healthService.readiness()
    } catch (error) {
      this.logger.error(error)
    } finally {
      this.isRunningHealthCheck = false
    }
  }

  onModuleInit(): void {
    const nb = this.configService.get('intervalHealthCheck')
    const interval = setInterval(this.checkHealthPeriodically.bind(this), nb * 1000)
    this.schedulerRegistry.addInterval('IntervalHealCheck', interval)
  }
}
