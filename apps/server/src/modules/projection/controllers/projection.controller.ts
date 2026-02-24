import {
  Controller,
  Post,
} from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { Roles } from '@biblio-num/shared'
import { ProjectionManagerService } from '@/modules/projection/services/projection-manager/projection-manager.service'

@Controller('projections')
export class ProjectionController {
  constructor(
    private readonly logger: LoggerService,
    private readonly projectionManager: ProjectionManagerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post('init')
  @Role(Roles.sudo)
  @UsualApiOperation({
    summary: 'Construit les tables de projections pour la première fois.',
    method: 'POST',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  async initProjection(): Promise<void> {
    this.logger.verbose('===> Init projections !!')
    await this.projectionManager.InitFirsTime()
  }
}
