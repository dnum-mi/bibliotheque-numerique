import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { JobLogService } from '../providers/job-log.service'
import { JobLog } from '../objects/job-log.entity'
import { Roles } from '../../roles/providers/roles.guard'

@ApiTags('Job-log')
@Controller('job-log')
export class JobLogController {
  constructor (private readonly service: JobLogService) {}

  @Get('')
  @Roles('admin')
  // TODO: when pagination modules exist, use it here.
  async getLast10JobLogs (): Promise<JobLog[]> {
    return this.service.getLast10JobLogs()
  }
}
