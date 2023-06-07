import { Controller, Get } from "@nestjs/common";
import { JobLogService } from "../providers/job-log.service";
import { JobLog } from "../objects/job-log.entity";
import { Roles } from "modules/roles/providers/roles.guard";

@Controller("job-log")
export class JobLogController {
  constructor(private readonly service: JobLogService) {}

  @Get("")
  @Roles("admin")
  // TODO: when pagination modules exist, use it here.
  async getLast10JobLogs(): Promise<JobLog[]> {
    return this.service.getLast10JobLogs();
  }
}
