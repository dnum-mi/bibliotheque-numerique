import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '../../../shared/modules/logger/logger.service'

import { UsualApiOperation } from '../../../shared/documentation/usual-api-operation.decorator'
import { Roles } from '@biblio-num/shared'
import { Role } from '../../users/providers/decorators/role.decorator'
import { LeanDossierOutputDto } from '../objects/dto/lean-dossier-output.dto'
import { DossierService } from '../providers/dossier.service'

@ApiTags('Dossiers', 'Organismes')
@ApiTags('Organismes')
@Controller('dossiers/organismes')
export class DossierOrganismeController {
  constructor(
    private readonly logger: LoggerService,
    private readonly dossierService: DossierService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get(':organismeNumber')
  @UsualApiOperation({
    summary: "Retourne les dossiers d'un organisme",
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: LeanDossierOutputDto,
    isArray: true,
    supplement: 'Pas de mécanisme de pagination.',
  })
  @Role(Roles.instructor)
  async getDossiersByOrganisme(
    @Param('organismeNumber') id: string,
  ): Promise<LeanDossierOutputDto[]> {
    this.logger.verbose('getOrganismeDossiers')
    return this.dossierService.findDossiersByOrganismeNumber(id)
  }
}
