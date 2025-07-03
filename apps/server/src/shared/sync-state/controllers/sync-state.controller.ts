import { LoggerService } from '../../modules/logger/logger.service'
import { SyncState } from '../objects/entities/sync-state.entity'
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { SyncStateService } from '../services/sync-state.service'
import { ApiTags } from '@nestjs/swagger'
import { Role } from '../../../modules/users/providers/decorators/role.decorator'
import { Roles } from '@biblio-num/shared'

@ApiTags('Status Synchronization')
@Controller('sync-state')
export class SyncStateController {
  constructor(
    private readonly logger: LoggerService,
    private readonly syncStateService: SyncStateService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get(':id')
  @Role(Roles.instructor)
  getSyncState(
      @Param('id', ParseIntPipe) id: number,
  ): Promise<SyncState> {
    return this.syncStateService.findOneById(id)
  }
}
