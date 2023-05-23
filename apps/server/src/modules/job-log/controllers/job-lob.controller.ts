import { Controller, Get } from "@nestjs/common";
import { JobLogService } from "../providers/job-log.service";
import { JobLog } from "../objects/job-log.entity";

@Controller("job-log")
export class JobLogController {
  constructor(private readonly service: JobLogService) {}

  @Get("")
  // TODO: when pagination module exist, use it here.
  async getLast10JobLogs(): Promise<JobLog[]> {
    return this.service.getLast10JobLogs();
  }
}
