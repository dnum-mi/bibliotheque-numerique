import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common'
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  IOrganisme,
  LeanDossierOutputDto,
  PaginatedDto,
  PaginationDto,
  Roles,
} from '@biblio-num/shared'
import { mapOrganismeFieldHeader } from '@biblio-num/shared-utils'

import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { xlsxContent } from '../../../shared/modules/xlsx/xlsx.constants'
import { ServerResponse } from 'http'
import { XlsxService } from '../../../shared/modules/xlsx/xlsx.service'

@ApiTags('Demarches')
@Controller('organismes')
export class OrganismeController {
  constructor(
    private readonly logger: LoggerService,
    private readonly dossierService: DossierService,
    private readonly organismeService: OrganismeService,
    private readonly xlsxService: XlsxService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post('list')
  @HttpCode(200)
  @Role(Roles.instructor)
  @ApiResponse({ status: 200 })
  async listOrganisme(
    @Body() dto: PaginationDto<IOrganisme>,
  ): Promise<PaginatedDto<IOrganisme>> {
    this.logger.verbose('listOrganisme')
    return this.organismeService.listOrganisme(dto)
  }

  @Get(':organismeId/dossiers')
  @Role(Roles.instructor)
  async getOrganismeDossiers(
    @Param('organismeId') id: string,
  ): Promise<LeanDossierOutputDto[]> {
    this.logger.verbose('getOrganismeDossiers')
    return this.dossierService.getOrganismeDossiers(+id)
  }

  @Get(':organismeId')
  @Role(Roles.instructor)
  async getOrganisme(
    @Param('organismeId', ParseIntPipe) id: number,
  ): Promise<IOrganisme> {
    this.logger.verbose('getOrganisme')
    if (isNaN(id)) {
      throw new BadRequestException('Invalid id')
    }
    return this.organismeService.findOneOrThrow({ where: { id } })
  }

  @Get('rna/:organismeIdRna')
  @Role(Roles.instructor)
  async getOrganismeWithRna(
    @Param('organismeIdRna') idRna: string,
  ): Promise<IOrganisme> {
    this.logger.verbose('getOrganismeWithRna')
    return this.organismeService.findOneOrThrow({ where: { idRna } })
  }

  @Get('rnf/:organismeIdRnf')
  @Role(Roles.instructor)
  async getOrganismeWithRnf(
    @Param('organismeIdRnf') idRnf: string,
  ): Promise<IOrganisme> {
    this.logger.verbose('getOrganismeWithRnf')
    return this.organismeService.findOneOrThrow({ where: { idRnf } })
  }

  @Post('list/export/xlsx')
  @HttpCode(200)
  @Role(Roles.instructor)
  @ApiOkResponse({ description: 'Excel file served successfully', content: xlsxContent })
  @Header('Content-type', Object.keys(xlsxContent)[0])
  @Header('Content-Disposition', 'export.xlsx')
  async listOrganismeXlsx(
    @Body() dto: PaginationDto<IOrganisme>,
    @Res() res: ServerResponse,
  ): Promise<void> {
    this.logger.verbose('Export xlxs - listOrganisme')
    const { data } = await this.organismeService.listOrganisme(dto)
    this.xlsxService.generateXlsxFileWithMapHeader(data, mapOrganismeFieldHeader, dto.columns).pipe(res)
  }
}
