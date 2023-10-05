import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DemarcheService } from '../providers/services/demarche.service'
import {
  PermissionsGuard,
  RequirePermissions,
} from '../../roles/providers/permissions.guard'
import { PermissionName } from '@/shared/types/Permission.type'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Demarche } from '../objects/entities/demarche.entity'
import { Dossier } from '../../dossiers/objects/entities/dossier.entity'
import { DemarcheSynchroniseService } from '../providers/services/demarche-synchronise.service'
import { Roles, RolesGuard } from '../../roles/providers/roles.guard'
import { User } from '../../users/entities/user.entity'
import {
  DemarcheOutputDto,
  demarcheOutputDtoKeys,
} from '@/modules/demarches/objects/dtos/demarche-output.dto'
import { CurrentUser } from '@/modules/users/decorators/current-user.decorator'
import { SmallDemarcheOutputDto, CreateDemarcheDto } from '@biblio-num/shared'
import { UpdateDemarcheDto } from '@/modules/demarches/objects/dtos/update-demarche.dto'

@ApiTags('Demarches')
@UseGuards(PermissionsGuard)
@Controller('demarches')
export class DemarcheController {
  constructor(
    private readonly demarcheService: DemarcheService,
    private readonly demarcheSynchroniseService: DemarcheSynchroniseService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('small')
  async allSmallDemarche(): Promise<SmallDemarcheOutputDto[]> {
    this.logger.verbose('allSmallDemarche')
    return this.demarcheService.repository
      .find({ select: ['id', 'title', 'dsDataJson'] })
      .then((demarches) => {
        return demarches.map((d) => ({
          id: d.id,
          title: d.title,
          dsId: d.dsDataJson?.number,
        }))
      })
  }

  @Get()
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarches(@CurrentUser() user: User): Promise<Demarche[]> {
    this.logger.verbose('getDemarches')
    return this.demarcheService.findWithPermissions(user)
  }

  @Get(':id')
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarcheById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DemarcheOutputDto> {
    this.logger.verbose('getDemarcheById')
    const ruleIds = this.demarcheService.getRulesFromUserPermissions(req.user)
    if (
      ruleIds &&
      ruleIds.length > 0 &&
      !ruleIds.find((ruleId) => ruleId === id)
    ) {
      throw new HttpException(
        `Not authorized access for demarche id: ${id}`,
        HttpStatus.FORBIDDEN,
      )
    }

    return this.demarcheService.findOneOrThrow({
      where: { id },
      select: demarcheOutputDtoKeys,
    })
  }

  // TODO: delete
  @Get(':id/deprecated/dossiers')
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarcheDossiersById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Dossier[]> {
    this.logger.verbose('getDemarcheDossiersById')
    const demarche = await this.demarcheService.findById(id)
    if (!demarche) {
      throw new NotFoundException(`Demarche id: ${id} not found`)
    }
    return demarche.dossiers
  }

  @Post('create')
  @Roles('admin') // TODO: superadmin
  async create(@Body() dto: CreateDemarcheDto): Promise<{ message: string }> {
    this.logger.verbose('create')
    await this.demarcheSynchroniseService.createAndSynchronise(
      dto.idDs,
      dto.identification,
    )
    return { message: `Demarche with DS id ${dto.idDs} has been created.` }
  }

  @Post('synchro-dossiers')
  @Roles('admin') // TODO: superadmin
  async synchroDossiers(
    @Body('idDs', ParseIntPipe) idDs: number,
  ): Promise<{ message: string }> {
    this.logger.verbose('synchroDossiers')
    await this.demarcheSynchroniseService.synchroniseOneDemarche(idDs, true)
    return { message: `Demarche with DS id ${idDs} has been synchronised.` }
  }

  @Patch(':id')
  @Roles('admin') // TODO: superadmin
  async updateIdendtication(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDemarcheDto,
  ): Promise<{ message: string }> {
    this.logger.verbose(`update identification of demarche ${id}`)
    await this.demarcheService.updateDemarche(id, dto)
    if (!Object.keys(dto).length) {
      throw new BadRequestException('Identification and types are undefined')
    }
    return {
      message: `Demarche of id ${id} has been update with identification ${dto.identification} and types ${dto.types}.`,
    }
  }
}
