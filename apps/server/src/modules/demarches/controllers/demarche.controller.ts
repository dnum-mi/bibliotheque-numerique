import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DemarcheService } from '../providers/demarche.service'
import {
  PermissionsGuard,
  RequirePermissions,
} from '../../roles/providers/permissions.guard'
import { PermissionName } from '../../../shared/types/Permission.type'
import { filterObjectFields } from '@biblio-num/shared'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { Demarche } from '../objects/entities/demarche.entity'
import { Dossier } from '../../dossiers/objects/entities/dossier.entity'
import { DemarcheSynchroniseService } from '../providers/demarche-synchronise.service'

@ApiTags('Demarches')
@UseGuards(PermissionsGuard)
@Controller('demarches')
export class DemarcheController {
  constructor (
    private readonly demarcheService: DemarcheService,
    private readonly demarcheSynchroniseService: DemarcheSynchroniseService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get()
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarches (@Request() req): Promise<Demarche[]> {
    const demarches = await this.demarcheService.findWithPermissions(req.user)
    if (demarches.length === 0) {
      throw new NotFoundException('No demarche found')
    }
    return demarches
  }

  @Get(':id')
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarcheById (
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('fields', new ParseArrayPipe({ separator: ',', optional: true }))
      fields: string[],
  ): Promise<Demarche | Partial<Demarche>> {
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

    const demarche = await this.demarcheService.findById(id)
    if (!demarche) {
      throw new NotFoundException(`Demarche id: ${id} not found`)
    }
    return fields?.length > 0 ? filterObjectFields(fields, demarche) : demarche
  }

  @Get('ds/:id')
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarcheByDsId (
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('fields', new ParseArrayPipe({ separator: ',', optional: true }))
      fields?: string[],
  ): Promise<Demarche | Partial<Demarche>> {
    const ids = this.demarcheService.getRulesFromUserPermissions(req.user)
    const demarche = await this.demarcheService.findByDsId(id)

    if (
      ids &&
      ids.length > 0 &&
      !ids.find((ruleId) => ruleId === demarche.id)
    ) {
      throw new ForbiddenException(
        `Not authorized access for demarche id: ${id}`,
      )
    }
    if (!demarche) {
      throw new NotFoundException(`Demarche number: ${id} not found`)
    }
    return fields?.length > 0 ? filterObjectFields(fields, demarche) : demarche
  }

  @Get(':id/dossiers')
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarcheDossiersById (
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Dossier[]> {
    const demarche = await this.demarcheService.findById(id)
    if (!demarche) {
      throw new NotFoundException(`Demarche id: ${id} not found`)
    }
    return demarche.dossiers
  }

  @Post('create')
  // @RequirePermissions() // TODO: manage permissions
  async create (
    @Body('idDs', ParseIntPipe) dsId: number,
  ): Promise<{ message: string }> {
    await this.demarcheSynchroniseService.createAndSynchronise(dsId)
    return { message: `Demarche with DS id ${dsId} has been created.` }
  }

  @Post('synchro-dossiers')
  // @RequirePermissions() // TODO: manage permissions
  async synchroDossiers (
    @Body('idDs', ParseIntPipe) idDs: number,
  ): Promise<{ message: string }> {
    await this.demarcheSynchroniseService.synchroniseOneDemarche(idDs)
    return { message: `Demarche with DS id ${idDs} has been synchronised.` }
  }

  @Patch(':dsId')
  @RequirePermissions()
  async updateDemarche (
    @Param('dsId', ParseIntPipe) dsId: number,
    @Body() demarche: Partial<Demarche>,
  ): Promise<void> {
    await this.demarcheService.updateWithDsId(dsId, demarche)
  }
}
