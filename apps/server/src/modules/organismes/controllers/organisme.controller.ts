import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { IOrganisme, LeanDossierOutputDto, PaginatedOrganismeDto, PaginationDto } from '@biblio-num/shared'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import {
  PermissionsGuard,
  RequirePermissions,
} from '@/modules/roles/providers/permissions.guard'
import { PermissionName } from '@/shared/types/Permission.type'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'

@ApiTags('Demarches')
@UseGuards(PermissionsGuard)
@Controller('organismes')
export class OrganismeController {
  constructor(
    private readonly logger: LoggerService,
    private readonly dossierService: DossierService,
    private readonly organismeService: OrganismeService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post('list')
  @HttpCode(200)
  @ApiResponse({ status: 200 })
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async listOrganisme(@Body() dto: PaginationDto<IOrganisme>): Promise<PaginatedOrganismeDto> {
    return this.organismeService.listOrganisme(dto)
  }

  @Get(':organismeId/dossiers')
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getOrganismeDossiers(
    @Param('organismeId') id: string,
  ): Promise<LeanDossierOutputDto[]> {
    return this.dossierService.getOrganismeDossiers(+id)
  }

  @Get(':organismeId')
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getOrganisme(
    @Param('organismeId', ParseIntPipe) id: number,
  ): Promise<IOrganisme> {
    if (isNaN(id)) {
      throw new BadRequestException('Invalid id')
    }
    return this.organismeService.findOneOrThrow({ where: { id } })
  }

  @Get('rna/:organismeIdRna')
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getOrganismeWithRna(
    @Param('organismeIdRna') idRna: string,
  ): Promise<IOrganisme> {
    return this.organismeService.findOneOrThrow({ where: { idRna } })
  }

  @Get('rnf/:organismeIdRnf')
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getOrganismeWithRnf(
    @Param('organismeIdRnf') idRnf: string,
  ): Promise<IOrganisme> {
    return this.organismeService.findOneOrThrow({ where: { idRnf } })
  }
}
