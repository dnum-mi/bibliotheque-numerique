import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/shared/modules/logger/logger.service'

import {
  eJobName,
  JobNameKey,
} from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { SyncAllDemarcheJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'

@Injectable()
export class CronService implements OnApplicationBootstrap {
  private jobCron: { name: JobNameKey; cron: string, payload?: object }[] = []

  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private _loadCronJobTimes(): void {
    this.jobCron = [
      {
        name: eJobName.SyncAllDemarche,
        cron: this.config.get('cron').syncAllDemarche,
        payload: {
          fromScratch: false,
        } as SyncAllDemarcheJobPayload,
      },
      {
        name: eJobName.SyncAllRnfOrganisme,
        cron: this.config.get('cron').syncAllRnfOrganisme,
      },
      {
        name: eJobName.SyncAllRnaOrganisme,
        cron: this.config.get('cron').syncAllRnaOrganisme,
      },
      {
        name: eJobName.ComputeTimeTracking,
        cron: this.config.get('cron').computeTimeTracking,
      },
      {
        name: eJobName.ComputeOrganismeDDC,
        cron: this.config.get('cron').computeOrganismeDDC,
      },
      {
        name: eJobName.AnonymiseAll,
        cron: this.config.get('cron').anonymiseDossiers,
      },
    ]
  }

  private async _registerAllCronJobs(): Promise<void> {
    this.logger.verbose('_registerAllCronJobs')
    this._loadCronJobTimes()
    const delayedJobs = await this.syncQueue.getJobs(['delayed'])
    const repeatableJobs = await this.syncQueue.getRepeatableJobs()
    for (const job of this.jobCron) {
      const delayedJobsName = delayedJobs.filter(j => j.name === job.name)
      if (delayedJobsName.length) {
        this.logger.debug('Remove an already existing job in delayed: ' + job.name)
        await Promise.all(delayedJobsName.map(async (j) => j.remove()))
      }
      const repeatableJobsByJob = repeatableJobs.filter(j => j.name === job.name)
      if (repeatableJobsByJob.length) {
        this.logger.debug('Remove an already existing job in repeatable: ' + job.name)
        await Promise.all(repeatableJobsByJob.map(j => this.syncQueue.removeRepeatableByKey(j.key)))
      }
      await this.syncQueue.removeRepeatableByKey(`${job.name}:.*`)

      this.logger.debug('adding job ' + job.name + ' with cron ' + job.cron)
      await this.syncQueue.add(job.name, job.payload || null, {
        jobId: 1,
        repeat: {
          cron: job.cron,
        },
      })
    }
  }

  onApplicationBootstrap(): void {
    this.logger.verbose('onApplicationBootStrap')
    if (!this.config.get('cron').skipCronInitialization) {
      this._registerAllCronJobs()
    }
  }
}
