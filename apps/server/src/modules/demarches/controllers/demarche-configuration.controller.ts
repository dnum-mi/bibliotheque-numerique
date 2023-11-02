import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DemarcheService } from '../providers/services/demarche.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentDemarcheInterceptor } from '../providers/interceptors/current-demarche.interceptor'
import { Demarche } from '../objects/entities/demarche.entity'
import { CurrentDemarche } from '../providers/decorators/current-demarche.decorator'
import {
  MappingColumn, Roles,
  UpdateOneFieldConfigurationDto,
} from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'

@ApiTags('Demarches')
@ApiTags('Configurations')
@UseInterceptors(CurrentDemarcheInterceptor)
@Controller('demarches/:demarcheId/configurations')
export class DemarcheConfigurationController {
  constructor(
    private readonly demarcheService: DemarcheService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get()
  @Role(Roles.admin)
  async getDemarcheConfiguration(
    @CurrentDemarche() demarche: Demarche,
  ): Promise<MappingColumn[]> {
    this.logger.verbose('getDemarcheConfiguration')
    return demarche.mappingColumns
  }

  @Patch(':fieldId')
  @Role(Roles.admin)
  async updateOneFieldConfiguration(
    @CurrentDemarche() demarche: Demarche,
    @Param('fieldId') fieldId: string,
    @Body() dto: UpdateOneFieldConfigurationDto,
  ): Promise<boolean> {
    this.logger.verbose('updateOneFieldConfiguration')
    const field = demarche.mappingColumns
      .map((m) => [m, ...(m.children ?? [])])
      .flat(1)
      .find((f) => f.id === fieldId)
    if (!field) {
      throw new NotFoundException('No field with this id')
    }
    field.columnLabel = dto.columnLabel
    return this.demarcheService.updateOrThrow(demarche.id, demarche)
  }
}
