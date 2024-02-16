import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { CurrentUser } from '@/modules/users/providers/decorators/current-user.decorator'
import { User } from '@/modules/users/objects/user.entity'
import { LogInputDto } from '@/shared/modules/logger/log-input.dto'

@ApiTags('Log')
@Role('any')
@Controller('logging')
export class LogController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  @Post()
  client(@Body() dto: LogInputDto, @CurrentUser() user: User): void {
    this.logger.verbose('client')
    this.logger.logClient({
      message: dto.message,
      user,
      ...dto.meta,
    }, dto.level)
  }
}
