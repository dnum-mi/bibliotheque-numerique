import { Body, Controller, Get, NotFoundException, Param, Patch, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DemarcheService } from '../providers/services/demarche.service'
import { PermissionsGuard, RequirePermissions } from '../../roles/providers/permissions.guard'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { PermissionName } from '@/shared/types/Permission.type'
import { CurrentDemarcheInterceptor } from '../providers/interceptors/current-demarche.interceptor'
import { Demarche } from '../objects/entities/demarche.entity'
import { CurrentDemarche } from '../providers/decorators/current-demarche.decorator'
import { MappingColumn, UpdateOneFieldConfigurationDto } from '@biblio-num/shared'

@ApiTags('Demarches')
@ApiTags('Configurations')
@UseGuards(PermissionsGuard) // TODO: only admin can update configuration ?
@RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
@UseInterceptors(CurrentDemarcheInterceptor)
@Controller('demarches/:demarcheId/configurations')
export class DemarcheConfigurationController {
  constructor (
    private readonly demarcheService: DemarcheService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get()
  async getDemarcheConfiguration (@CurrentDemarche() demarche: Partial<Demarche>): Promise<MappingColumn[]> {
    this.logger.verbose('getDemarcheConfiguration')
    return demarche.mappingColumns
  }

  @Patch(':fieldId')
  async updateOneFieldConfiguration (
    @CurrentDemarche() demarche: Partial<Demarche>,
    @Param('fieldId') fieldId: string,
    @Body() dto: UpdateOneFieldConfigurationDto,
  ): Promise<boolean> {
    this.logger.verbose('updateOneFieldConfiguration')
    const field = demarche.mappingColumns
      .map((m) => [m, ...m.children ?? []])
      .flat(1)
      .find((f) => f.id === fieldId)
    if (!field) {
      throw new NotFoundException('No field with this id')
    }
    field.columnLabel = dto.columnLabel
    return this.demarcheService.updateOrThrow(demarche.id, demarche)
  }
}
