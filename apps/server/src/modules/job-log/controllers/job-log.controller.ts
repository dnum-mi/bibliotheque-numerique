import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { JobLogService } from '../providers/job-log.service'
import { JobLog } from '../objects/job-log.entity'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { Roles } from '@biblio-num/shared'

@ApiTags('Job-log')
@Controller('job-log')
export class JobLogController {
  constructor (private readonly service: JobLogService) {}

  @Get('')
  @Role(Roles.sudo)
  // TODO: when pagination modules exist, use it here.
  async getLast10JobLogs (): Promise<JobLog[]> {
    return this.service.getLast10JobLogs()
  }
}
