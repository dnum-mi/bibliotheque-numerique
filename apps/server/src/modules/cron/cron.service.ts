import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/shared/modules/logger/logger.service'

import {
  JobName,
  JobNameKeys,
} from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { SyncAllDemarchePayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'

@Injectable()
export class CronService implements OnApplicationBootstrap {
  private jobCron: { name: JobNameKeys; cron: string, payload?: object }[] = []

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
        name: JobName.SyncAllDemarche,
        cron: this.config.get('cron').syncAllDemarche,
        payload: {
          fromScratch: false,
        } as SyncAllDemarchePayload,
      },
      {
        name: JobName.SyncAllRnfOrganisme,
        cron: this.config.get('cron').syncAllRnfOrganisme,
      },
      {
        name: JobName.SyncAllRnaOrganisme,
        cron: this.config.get('cron').syncAllRnaOrganisme,
      },
      {
        name: JobName.ComputeTimeTracking,
        cron: this.config.get('cron').computeTimeTracking,
      },
    ]
  }

  private async _registerAllCronJobs(): Promise<void> {
    this.logger.verbose('_registerAllCronJobs')
    this._loadCronJobTimes()
    for (const job of this.jobCron) {
      const existingJob = await this.syncQueue.getJob(job.name)
      if (existingJob) {
        this.logger.debug('Remove an already existing job: ' + job.name)
        await existingJob.remove()
      }
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
    this._registerAllCronJobs()
  }
}
