import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JobLog } from '../objects/job-log.entity'
import { Repository, UpdateResult } from 'typeorm'
import { JobNamesKeys } from '../../cron/job-name.enum'
import { JobStatus, JobStatusValues } from '../objects/job-status.enum'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import { LoggerService } from '../../../shared/modules/logger/logger.service'

@Injectable()
export class JobLogService extends BaseEntityService<JobLog> {
  constructor (@InjectRepository(JobLog) protected repo: Repository<JobLog>, protected logger: LoggerService) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async createJobLog (name: JobNamesKeys): Promise<JobLog> {
    this.logger.verbose('createJobLog')
    return this.createAndSave({ jobName: name })
  }

  async getLast10JobLogs (): Promise<JobLog[]> {
    this.logger.verbose('getLast10JobLogs')
    return this.repo.find({ order: { id: 'DESC' }, take: 10 })
  }

  private async _setJobLogStatus (id: number, status: JobStatusValues, log?: string): Promise<UpdateResult> {
    this.logger.verbose('_setJobLogStatus')
    return this.repo.update(
      { id },
      {
        jobStatus: status,
        overAt: new Date(),
        log,
      },
    )
  }

  public async setJobLogSuccess (id: number, log?: string): Promise<UpdateResult> {
    this.logger.verbose('setJobLogSuccess')
    return this._setJobLogStatus(id, JobStatus.SUCCESS, log)
  }

  public async setJobLogFailure (id: number, log?: string): Promise<UpdateResult> {
    this.logger.verbose('setJobLogFailure')
    return this._setJobLogStatus(id, JobStatus.FAILURE, log)
  }
}
