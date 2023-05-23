import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JobLog } from "../objects/job-log.entity";
import { Repository, UpdateResult } from "typeorm";
import { JobNamesKeys } from "../../cron/job-name.enum";
import { JobStatus, JobStatusValues } from "../objects/job-status.enum";

@Injectable()
export class JobLogService {
  constructor(@InjectRepository(JobLog) private repo: Repository<JobLog>) {}

  async createJobLog(name: JobNamesKeys): Promise<JobLog> {
    const jobLog = this.repo.create({ jobName: name });
    await this.repo.save(jobLog);
    return jobLog;
  }

  async getLast10JobLogs(): Promise<JobLog[]> {
    return this.repo.find({ order: { id: "DESC" }, take: 10 });
  }

  private async _setJobLogStatus(
    id: number,
    status: JobStatusValues,
    log?: string,
  ): Promise<UpdateResult> {
    return this.repo.update(
      { id },
      {
        jobStatus: status,
        overAt: new Date(),
        log,
      },
    );
  }

  public async setJobLogSuccess(
    id: number,
    log?: string,
  ): Promise<UpdateResult> {
    return this._setJobLogStatus(id, JobStatus.SUCCESS, log);
  }

  public async setJobLogFailure(
    id: number,
    log?: string,
  ): Promise<UpdateResult> {
    return this._setJobLogStatus(id, JobStatus.FAILURE, log);
  }
}
