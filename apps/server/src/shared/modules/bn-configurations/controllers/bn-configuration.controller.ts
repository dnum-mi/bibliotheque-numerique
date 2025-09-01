import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { BnConfigurationOutputDto } from '@/shared/modules/bn-configurations/objects/dto/bn-configuration-output.dto'

import { BnConfigurationService } from '@/shared/modules/bn-configurations/providers/bn-configuration.service'
import { CreateBnConfigurationDto } from '../objects/dto/create-bn-configuration.dto'
import { UpdateBnConfigurationDto } from '../objects/dto/update-bn-configuration.dto'
import { BnConfigurationKey, eBnConfiguration, Roles } from '@biblio-num/shared'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'

@ApiTags('BnConfigurations')
@Controller('bn-configurations')
export class BnConfigurationController {
  constructor(
    private readonly configurationService: BnConfigurationService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get()
  @UsualApiOperation({
    summary: 'Retourne les configurations de Bibliothéque Numérique.',
    method: 'GET',
    minimumRole: Roles.sudo,
    responseType: BnConfigurationOutputDto,
    isArray: true,
  })
  @Role(Roles.sudo)
  async getConfigurations(): Promise<BnConfigurationOutputDto[]> {
    this.logger.verbose('getConfigurations')
    return this.configurationService.findAll()
  }

  @Get('enable-hub-search')
  @UsualApiOperation({
    summary: 'siaf est-il actif?',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: null,
  })
  @Role(Roles.instructor)
  async getEnableHubSearch(): Promise<boolean> {
    this.logger.verbose('getEnableHubSearch')
    return (await this.configurationService.getValueByKeyName(eBnConfiguration.ENABLE_HUB_SEARCH)) as boolean
  }

  @UsualApiOperation({
    summary: 'Retourne une configuration.',
    method: 'GET',
    minimumRole: Roles.sudo,
    responseType: BnConfigurationOutputDto,
  })
  @Get(':keyName')
  @Role(Roles.sudo)
  async getConfigurationByKey(
    @Param('keyName') keyName: BnConfigurationKey,
  ): Promise<BnConfigurationOutputDto> {
    this.logger.verbose('getConfigurationByKey')
    if (!keyName) {
      throw new BadRequestException('keyName is required')
    }
    if (!eBnConfiguration[keyName]) {
      throw new BadRequestException('keyName is invalid')
    }
    return this.configurationService.findByKeyName(keyName)
  }

  @Post()
  @ApiOperation({
    summary: 'Créé une configuration.',
    description:
      'Créé une configuration. Route seulement accessible pour les utilisateurs sudo',
  })
  @UsualApiOperation({
    summary: 'Créer une configuration.',
    method: 'POST',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  @Role(Roles.sudo)
  async create(@Body() dto: CreateBnConfigurationDto): Promise<void> {
    this.logger.verbose('createConfiguration')
    await this.configurationService.createAndSave(dto)
  }

  @Patch(':id')
  @UsualApiOperation({
    summary: 'Modifie une configuration.',
    method: 'PATCH',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  @Role(Roles.sudo)
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateBnConfigurationDto,
  ): Promise<void> {
    this.logger.verbose('updateConfiguration')
    await this.configurationService.updateOrThrow(id, dto)
  }

  @Delete(':id')
  @UsualApiOperation({
    summary: 'Supprime une configuration.',
    method: 'DELETE',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  @Role(Roles.sudo)
  async delete(@Param('id') id: number): Promise<void> {
    this.logger.verbose('deleteConfiguration')
    await this.configurationService.remove(id)
  }
}
