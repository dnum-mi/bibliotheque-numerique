import { Body, Controller, Get, Patch, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DemarcheService } from '../providers/services/demarche.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentDemarcheInterceptor } from '../providers/interceptors/current-demarche.interceptor'
import { Demarche } from '../objects/entities/demarche.entity'
import { CurrentDemarche } from '../providers/decorators/current-demarche.decorator'

import { Roles } from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { DemarcheOptionOutputDto } from '@/modules/demarches/objects/dtos/demarche-option-output.dto'
import { DemarcheOptionInputDto } from '@/modules/demarches/objects/dtos/demarche-option-input.dto'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'

@ApiTags('Demarches')
@ApiTags('Configurations')
@UseInterceptors(CurrentDemarcheInterceptor)
@Controller('demarches/:demarcheId/options')
export class DemarcheOptionController {
  constructor(
    private readonly demarcheService: DemarcheService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get()
  @UsualApiOperation({
    summary: "Retourne les options d'une démarche.",
    method: 'PATCH',
    minimumRole: Roles.admin,
    responseType: DemarcheOptionOutputDto,
  })
  @Role(Roles.admin)
  async getDemarcheOption(
    @CurrentDemarche() demarche: Demarche,
  ): Promise<DemarcheOptionOutputDto> {
    this.logger.verbose('getDemarcheOption')
    return {
      nbrMonthAnonymisation: demarche.nbrMonthAnonymisation,
      isOnAllDossiersOfOrganisme: demarche.isOnAllDossiersOfOrganisme,
      anonymizationEvent: demarche.anonymizationEvent,
    }
  }

  @Patch()
  @UsualApiOperation({
    summary: "Modifie les options d'une démarche.",
    method: 'PATCH',
    minimumRole: Roles.admin,
    responseType: null,
  })
  @Role(Roles.admin)
  async updateDemarcheOption(
    @CurrentDemarche() demarche: Demarche,
    @Body() dto: DemarcheOptionInputDto,
  ): Promise<void> {
    this.logger.verbose('updateDemarcheOption')
    await this.demarcheService.updateOrThrow(demarche.id, dto)
  }
}
