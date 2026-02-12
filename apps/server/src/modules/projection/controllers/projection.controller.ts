import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { FieldProjectionService } from '@/modules/projection/services/field-projection/field-projection.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { Roles } from '@biblio-num/shared'

@Controller('projections')
export class ProjectionController {
  constructor(
    private readonly logger: LoggerService,
    private readonly demarcheService: DemarcheService,
    private readonly fieldProjectionService: FieldProjectionService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post(':demarcheId/fields')
  @Role(Roles.sudo)
  @UsualApiOperation({
    summary: "Reconstruit la table de projection 'fields' d'une démarche.",
    method: 'POST',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  async rebuildFieldProjection(
    @Param('demarcheId', ParseIntPipe) demarcheId: number,
  ): Promise<void> {
    this.logger.verbose(`rebuildFieldProjection ${demarcheId}`)

    const demarche = await this.demarcheService.findOneById(demarcheId)
    await this.fieldProjectionService.rebuild(demarche)

    this.logger.log(`Projection table rebuilt for demarche ${demarcheId}`)
  }
}
