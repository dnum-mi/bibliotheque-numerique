import { Body, Controller, Get, NotFoundException, Patch, UseInterceptors } from '@nestjs/common'
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
import { UpdateOneFieldAnonymizedDto } from '@/modules/demarches/objects/dtos/update-one-field-anonymized.dto'
import { MappingAnonymizedWithoutChildren } from '@/modules/demarches/objects/dtos/mapping-anonymized.dto'
import { findField } from '@/modules/demarches/utils/demarche.utils'

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

  @Patch('field/anonymized')
  @UsualApiOperation({
    summary: "Modifie la champ anonymisation d'une démarche.",
    method: 'PATCH',
    minimumRole: Roles.admin,
    responseType: null,
  })
  @Role(Roles.admin)
  async updateOneFieldAnonymized(
    @CurrentDemarche() demarche: Demarche,
    @Body() dto: UpdateOneFieldAnonymizedDto,
  ): Promise<boolean> {
    this.logger.verbose('updateOneFieldAnonymized')
    const fieldAnonymized = findField(demarche.mappingAnonymized, dto.id)
    if (!fieldAnonymized && dto.add) {
      const field = findField(demarche.mappingColumns, dto.id)
      if (!field) {
        throw new NotFoundException('No field with this id')
      }
      // add field
      demarche.mappingAnonymized.push({
        id: dto.id,
        columnLabel: '',
        originalLabel: field.originalLabel,
        source: field.source,
      } as MappingAnonymizedWithoutChildren)
    } else if (fieldAnonymized && !dto.add) {
      // remove field
      const index = demarche.mappingAnonymized.findIndex((f) => f.id === dto.id)
      if (index >= 0) {
        demarche.mappingAnonymized.splice(index, 1)
      } else {
        const parent = demarche.mappingAnonymized.find((m) =>
          m.children?.some((c) => c.id === dto.id),
        )
        if (parent) {
          const index = parent.children?.findIndex((c) => c.id === dto.id)
          if (index >= 0) {
            parent.children?.splice(index, 1)
          }
        }
      }
    }
    return this.demarcheService.updateOrThrow(demarche.id, demarche)
  }

  @Get('field/anonymized')
  @UsualApiOperation({
    summary: "Retourne les champs anonymisation d'une démarche.",
    method: 'GET',
    minimumRole: Roles.admin,
    responseType: MappingAnonymizedWithoutChildren,
    isArray: true,
  })
  @Role(Roles.admin)
  async getAnonymizedFields(
    @CurrentDemarche() demarche: Demarche,
  ): Promise<MappingAnonymizedWithoutChildren[]> {
    this.logger.verbose('getAnonymizedFields')
    return demarche.mappingAnonymized
  }
}
