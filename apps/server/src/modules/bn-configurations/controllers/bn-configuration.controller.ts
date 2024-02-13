import {
  BadRequestException,
  Body,
  Controller, Get, Param, Patch, Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import {
  Roles,
  BnConfigurationOutputDto,
  CreateBnConfigurationDto,
  UpdateBnConfigurationDto,
} from '@biblio-num/shared'
import { BnConfigurationService } from '@/modules/bn-configurations/providers/bn-configuration.service'

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
  @Role(Roles.sudo)
  async getConfigurations(): Promise<BnConfigurationOutputDto[]> {
    this.logger.verbose('getConfigurations')
    return this.configurationService.findAll()
  }

  @Get(':keyName')
  @Role(Roles.sudo)
  async getConfigurationByKey(@Param('keyName') keyName: string): Promise<BnConfigurationOutputDto> {
    this.logger.verbose('getConfigurationByKey')
    if (!keyName) {
      throw new BadRequestException('keyName is required')
    }
    return this.configurationService.findByKeyName(keyName)
  }

  @Post()
  @Role(Roles.sudo)
  async create(@Body() dto: CreateBnConfigurationDto): Promise<{ message: string }> {
    this.logger.verbose('createConfiguration')
    await this.configurationService.createAndSave(dto)
    return { message: `Configuration ${dto.keyName} has been created` }
  }

  @Patch(':id')
  @Role(Roles.sudo)
  async update(@Param('id') id: number, @Body() dto: UpdateBnConfigurationDto): Promise<{ message: string }> {
    this.logger.verbose('updateConfiguration')
    await this.configurationService.updateOrThrow(id, dto)
    return { message: `Configuration ${id} has been updated` }
  }
}
