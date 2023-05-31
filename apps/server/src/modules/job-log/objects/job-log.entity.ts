import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { JobNames, JobNamesKeys } from "../../cron/job-name.enum";
import { JobStatus, JobStatusValues } from "./job-status.enum";
import { ApplicationEntity } from "../../../shared/entities/application_entity";

// TODO: until we have a proper way to manage log, we use this table to store information about job execution
@Entity("job_logs")
export class JobLog extends ApplicationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  overAt: Date | null;

  @Column({
    type: "enum",
    enum: JobNames,
    default: JobNames.UNKNOWN_JOB,
  })
  jobName: JobNamesKeys;

  @Column({
    type: "enum",
    enum: JobStatus,
    default: JobStatus.RUNNING,
  })
  jobStatus: JobStatusValues;

  @Column({ nullable: true })
  log: string | null;
}
