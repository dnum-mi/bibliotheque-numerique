import { BadRequestException, Body, Controller, Get, Patch, Query } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { OnlyAdmin } from '@/modules/ds/providers/guards/only-admin.decorator'
import { DsConfigurationService } from '@/modules/ds/providers/ds-configuration.service'
import { DsConfigurationEntity } from '@/modules/ds/objects/ds-configuration.entity'
import { UpdateDsConfigurationInputDto } from '@/modules/ds/objects/dto/update-ds-configuration-input.dto'
import { FoundationService } from '@/modules/foundation/providers/foundation.service'

@ApiTags('DsConfiguration')
@OnlyAdmin()
@Controller('ds-configuration')
export class DsConfigurationController {
  constructor(
    private readonly logger: LoggerService,
    private readonly service: DsConfigurationService,
    private readonly foundationService: FoundationService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get('')
  @ApiOperation({
    summary: 'Retourne la configuration de DS. Seulement pour les admins.',
  })
  getConfiguration(): DsConfigurationEntity {
    this.logger.verbose('getConfiguration')
    return this.service.configuration
  }

  @Patch()
  @ApiOperation({
    summary: 'Modifie la configuration de DS.',
  })
  async updateConfiguration(
    @Body('dto') dto: UpdateDsConfigurationInputDto,
  ): Promise<boolean> {
    this.logger.verbose('updateConfiguration')
    return this.service.updateConfiguration(dto)
  }

  @Get('trigger-refresh')
  @ApiOperation({
    summary:
      'Manually trigger a refresh of foundation from modification or dissolution demarche. ',
  })
  async triggerRefresh(@Query('type') type: string) {
    switch (type) {
    case 'feModification':
      return this.foundationService.triggerFeModificationRefresh()
    case 'fddModification':
      return this.foundationService.triggerFddModificationRefresh()
    case 'feDissolution':
      return this.foundationService.triggerFeDissolution()
    case 'fddDissolution':
      return this.foundationService.triggerFddDissolution()
    case 'triggerFeAdministrationChanges':
      return this.foundationService.triggerFeAdministrationChanges()
    case 'triggerFddAdministrationChanges':
      return this.foundationService.triggerFddAdministrationChanges()
    case 'FrupModification':
      return this.foundationService.triggerFrupModificationRefresh()
    case 'FrupDissolution':
      return this.foundationService.triggerFrupDissolution()
    case 'all':
      return this.foundationService.triggerAllRefresh()
    }
    throw new BadRequestException('Invalid type in query.')
  }
}
