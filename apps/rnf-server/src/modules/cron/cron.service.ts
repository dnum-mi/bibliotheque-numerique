import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { CronJob } from 'cron'
import { SchedulerRegistry } from '@nestjs/schedule'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { DsConfigurationService } from '@/modules/ds/providers/ds-configuration.service'
import { FoundationService } from '@/modules/foundation/providers/foundation.service'

const refreshFoundationCronJobName = 'refreshFoundation'

@Injectable()
export class CronService implements OnModuleInit {
  cron: CronJob
  constructor(
    private readonly logger: LoggerService,
    private schedulerRegistry: SchedulerRegistry,
    @Inject(forwardRef(() => DsConfigurationService))
    private dsConfigurationService: DsConfigurationService,
    @Inject(forwardRef(() => FoundationService))
    private readonly foundationService: FoundationService,
  ) {
    this.logger.setContext(CronService.name)
  }

  private addCronJob() {
    this.cron = new CronJob(
      this.dsConfigurationService.configuration.cronUpdateFrequency ||
      '0 */5 * * *',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this._refreshFoundation.bind(this),
    )
    this.schedulerRegistry.addCronJob(
      refreshFoundationCronJobName,
      this.cron,
    )
    this.cron.start()
  }

  updateCron() {
    this.cron.stop()
    this.schedulerRegistry.deleteCronJob(refreshFoundationCronJobName)
    this.addCronJob()
  }

  onModuleInit(): void {
    this.addCronJob()
  }

  private async _refreshFoundation() {
    this.logger.verbose('refreshFoundation')
    this.logger.log('Refreshing foundation')
    await this.foundationService.triggerFeModificationRefresh()
    await this.foundationService.triggerFddModificationRefresh()
    await this.foundationService.triggerFeDissolution()
    await this.foundationService.triggerFddDissolution()
    this.logger.log('Setting lastRefreshedAt')
    await this.dsConfigurationService.updateConfiguration({
      foundationRefreshedAt: new Date(),
    })
  }
}
