import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { JobLogService } from '../job-log/providers/job-log.service'
import { JobNames } from './job-name.enum'
import { DemarcheSynchroniseService } from '../demarches/providers/services/demarche-synchronise.service'
import { OrganismesService } from '@/plugins/organisme/organismes/organismes.service'
import { TMapperJobs } from './mapper-jobs.type'

@Injectable()
export class CronService implements OnApplicationBootstrap, OnModuleInit {
  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private schedulerRegistry: SchedulerRegistry,
    private jobLogService: JobLogService,
    private demarcheSynchroniseService: DemarcheSynchroniseService,
    private organismeService: OrganismesService,
  ) {
    this.logger.setContext(this.constructor.name)
    this.logger.log('Cron fetching data is set at: ')
    this.logger.log(this.config.get('fetchDataInterval'))
  }

  private _dynamiclyBuildCronInRegistryFromConfig(): void {
    const mapperJobs: TMapperJobs = [
      {
        name: JobNames.FETCH_DATA_FROM_DS,
        cronTime: this.config.get('fetchDataInterval'),
        fct: this._fetchData,
        description: 'Fetching Data from Démarche Simplifiée',
      },
      {
        name: JobNames.UPDATE_ORGANISMES,
        cronTime: this.config.get('fetchDataInterval'),
        fct: this.jobUpdateOrgnanisme,
        description: 'Mise à jours des orgranismes',
      },
    ]

    mapperJobs.forEach((mapper) => {
      const job = new CronJob(mapper.cronTime, mapper.fct.bind(this))
      this.schedulerRegistry.addCronJob(mapper.description, job)
      job.start()
    })
  }

  private _launchCronOnStartup(): void {
    if (this.config.get('fetchDataOnStartup')) {
      this._fetchData(this.config.get('fetchDataOnStartupFromScratch'))
    } else {
      this.logger.log(
        'fetchDataOnStartup is set to false, skipping data fetching on startup',
      )
    }
  }

  onModuleInit(): void {
    this._dynamiclyBuildCronInRegistryFromConfig()
  }

  onApplicationBootstrap(): void {
    this._launchCronOnStartup()
  }

  private async _fetchData(fromScratch = false): Promise<void> {
    const jobLog = await this.jobLogService.createJobLog(
      JobNames.FETCH_DATA_FROM_DS,
    )
    // TODO: replace the behavior here when we have true logs.
    this.logger.startRegisteringLogs()
    this.logger.log("Synchronising all demarche with 'Démarches simplifiées'.")
    let error = false
    try {
      await this.demarcheSynchroniseService.synchroniseAllDemarches(fromScratch)
    } catch (e) {
      error = true
      this.logger.error(e)
      const logs = this.logger.stopRegisteringLog()
      this.jobLogService.setJobLogFailure(jobLog.id, logs.join('\n'))
    }
    if (!error) {
      const logs = this.logger.stopRegisteringLog()
      this.jobLogService.setJobLogSuccess(jobLog.id, logs.join('\n'))
    }
    this.logger.log('End synchronising.')
  }

  private async jobUpdateOrgnanisme(): Promise<void> {
    const organismes = await this.organismeService.findAll()
    organismes?.forEach(async (organisme) => {
      try {
        this.logger.verbose(
          `${JobNames.UPDATE_ORGANISMES}: updating ${organisme.idRef}`,
        )
        await this.organismeService.upsertOrganisme(organisme.idRef, [])
      } catch (error) {
        this.logger.error({
          message: `${JobNames.UPDATE_ORGANISMES}: ${error.message}`,
          error,
        })
      }
    })
  }
}
