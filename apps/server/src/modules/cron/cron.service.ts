import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { JobNames } from './job-name.enum'
import { DemarcheSynchroniseService } from '../demarches/providers/services/demarche-synchronise.service'
import { TMapperJobs } from './mapper-jobs.type'
import { InstructionTimesService } from '@/plugins/instruction_time/instruction_times/instruction_times.service'

@Injectable()
export class CronService implements OnApplicationBootstrap, OnModuleInit {
  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private schedulerRegistry: SchedulerRegistry,
    private demarcheSynchroniseService: DemarcheSynchroniseService,
    private instructionTimesService: InstructionTimesService,
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
        description: 'Fetching Data from Démarches Simplifiées',
      },
      // {
      //   name: JobNames.UPDATE_ORGANISMES,
      //   cronTime: this.config.get('fetchDataInterval'),
      //   fct: this.jobUpdateOrgnanisme,
      //   description: 'Mise à jours des orgranismes',
      // },
      {
        name: 'UPDATE-INSTRUCTION-TIMES-CALCULATION',
        cronTime: this.config.get('fetchDelayCalculation'),
        fct: this._instructionTimesCalculation,
        description: 'Fetching instruction times',
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
    this.logger.log("Synchronising all demarche with 'Démarches simplifiées'.")
    try {
      await this.demarcheSynchroniseService.synchroniseAllDemarches(fromScratch)
    } catch (e) {
      this.logger.error(e)
    }
    this.logger.log('End synchronising.')
  }

  private async jobUpdateOrganisme(): Promise<void> {
    // TODO
  }

  private async _instructionTimesCalculation(): Promise<void> {
    try {
      this.logger.verbose('UPDATE-INSTRUCTION-TIMES-CALCULATION')
      this.instructionTimesService.instructionTimeCalculationForAllDossier()
    } catch (error) {
      this.logger.error({
        message: `UPDATE-INSTRUCTION-TIMES-CALCULATION: ${error.message}`,
        error,
      })
    }
  }
}
