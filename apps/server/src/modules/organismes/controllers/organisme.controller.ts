import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe, Patch,
  Post,
  Res,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'

import {
  Roles,
  mapOrganismeFieldHeader,
  IOrganisme,
  IOrganismeOutput,
  typeCategorieOrganisme,
  ISiafSearchOrganismeResponseOutput,
} from '@biblio-num/shared'

import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { xlsxContent } from '../../../shared/modules/xlsx/xlsx.constants'
import { ServerResponse } from 'http'
import { XlsxService } from '../../../shared/modules/xlsx/xlsx.service'
import { PaginationDto } from '@/shared/pagination/pagination.dto'
import { PaginatedDto } from '@/shared/pagination/paginated.dto'
import { LeanDossierOutputDto } from '@/modules/dossiers/objects/dto/lean-dossier-output.dto'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  SyncOneRnaOrganismeJobPayload, SyncOneRnfOrganismeJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'

@ApiTags('Organismes')
@Controller('organismes')
export class OrganismeController {
  constructor(
    private readonly logger: LoggerService,
    private readonly dossierService: DossierService,
    private readonly organismeService: OrganismeService,
    private readonly xlsxService: XlsxService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post('list')
  @UsualApiOperation({
    summary: 'Retourne une liste d\'organisme.',
    method: 'POST',
    minimumRole: Roles.instructor,
    isPagination: true,
    responseType: PaginatedDto<IOrganisme>,
  })
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
  @UsualApiOperation({
    summary: 'Recevoir les dossiers d\'un organisme.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: LeanDossierOutputDto,
    isArray: true,
    supplement: 'Pas de mécanisme de pagination.',
  })
  @Role(Roles.instructor)
  async getOrganismeDossiers(
    @Param('organismeId') id: string,
  ): Promise<LeanDossierOutputDto[]> {
    this.logger.verbose('getOrganismeDossiers')
    return this.dossierService.getOrganismeDossiers(+id)
  }

  @UsualApiOperation({
    summary: 'Retourner un organisme à partir de son ID.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: Organisme,
  })
  @Get(':organismeId')
  @Role(Roles.instructor)
  async getOrganisme(
    @Param('organismeId', ParseIntPipe) id: number,
  ): Promise<IOrganismeOutput> {
    this.logger.verbose('getOrganisme')
    if (isNaN(id)) {
      throw new BadRequestException('Invalid id')
    }

    const bn = await this.organismeService.findOneOrThrow({ where: { id } })
    if (bn.idRna) {
      return {
        bn,
        siaf: await this.organismeService.getAssocationFromSiaf(bn.idRna),
        type: typeCategorieOrganisme.rna,
      }
    } else if (bn.idRnf) {
      return {
        bn,
        siaf: await this.organismeService.getFondationFromSiaf(bn.idRnf),
        type: typeCategorieOrganisme.rnf,
      }
    } else {
      this.logger.warn(`Numéro RNA et Numéro RNF manquant pour l'organisme ${id}`)
      return {
        bn,
        siaf: null,
        type: typeCategorieOrganisme.unknown,
      }
    }
  }

  @UsualApiOperation({
    summary: 'Retourner un organisme à partir de son RNA.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: Organisme,
  })
  @Get('rna/:organismeIdRna')
  @Role(Roles.instructor)
  async getOrganismeWithRna(
    @Param('organismeIdRna') idRna: string,
  ): Promise<IOrganismeOutput> {
    this.logger.verbose('getOrganismeWithRna')
    const organisme: IOrganismeOutput = {
      bn: null,
      siaf: null,
      type: typeCategorieOrganisme.rna,
    }
    const results = await Promise.allSettled([
      this.organismeService.findOneOrThrow({ where: { idRna } }),
      this.organismeService.getAssocationFromSiaf(idRna),
    ])
    results.forEach((result, index) => {
      result.status === 'rejected'
        ? this.logger.warn(`${(index === 0 ? 'bn' : 'siaf')}: ${result.reason}`)
        : organisme[index === 0 ? 'bn' : 'siaf'] = result.value
    })

    if (!organisme.bn && !organisme.siaf) {
      throw new NotFoundException(`L'association ${idRna} non trouvé`)
    }
    return organisme
  }

  @UsualApiOperation({
    summary: 'Retourner un organisme à partir de son RNF.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: Organisme,
  })
  @Get('rnf/:organismeIdRnf')
  @Role(Roles.instructor)
  async getOrganismeWithRnf(
    @Param('organismeIdRnf') idRnf: string,
  ): Promise<IOrganismeOutput> {
    this.logger.verbose('getOrganismeWithRnf')
    const organisme: IOrganismeOutput = {
      bn: null,
      siaf: null,
      type: typeCategorieOrganisme.rnf,
    }
    const results = await Promise.allSettled([
      this.organismeService.findOneOrThrow({ where: { idRnf } }),
      this.organismeService.getFondationFromSiaf(idRnf),
    ])
    results.forEach((result, index) => {
      result.status === 'rejected'
        ? this.logger.warn(`${(index === 0 ? 'bn' : 'siaf')}: ${result.reason}`)
        : organisme[index === 0 ? 'bn' : 'siaf'] = result.value
    })
    if (!organisme.bn && !organisme.siaf) {
      throw new NotFoundException(`La fondation ${idRnf} non trouvé`)
    }
    return organisme
  }

  @ApiOperation({
    summary: 'Retourner un export excel.',
    description: 'Retourner un export excel de l\'ensemble des organismes à partir d\'un DTO de pagination.',
  })
  @UsualApiOperation({
    summary: 'Retourner un export excel.',
    supplement: 'L\'export excel correspond à tous les résultats de pagination sans les pages.',
    method: 'GET',
    minimumRole: Roles.instructor,
    isPagination: true,
    responseType: null,
  })
  @Post('list/export/xlsx')
  @HttpCode(200)
  @Role(Roles.instructor)
  @Header('Content-type', Object.keys(xlsxContent)[0])
  @Header('Content-Disposition', 'export.xlsx')
  async listOrganismeXlsx(
    @Body() dto: PaginationDto<IOrganisme>,
    @Res() res: ServerResponse,
  ): Promise<void> {
    this.logger.verbose('Export xlxs - listOrganisme')
    const { data } = await this.organismeService.listOrganisme(dto, true)
    this.xlsxService.generateXlsxFileWithMapHeader(data, mapOrganismeFieldHeader, dto.columns).pipe(res)
  }

  @UsualApiOperation({
    summary: 'Forcer la synchronisation d\'un organisme.',
    method: 'PATCH',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  @Patch(':id/sync')
  @Role(Roles.sudo)
  async synchroniseOne(@Param('id') id: number): Promise<void> {
    this.logger.verbose('synchroniseOne')
    const smallOrg = await this.organismeService.findOneById(id)
    if (smallOrg.idRna) {
      await this.syncQueue.add(eJobName.SyncOneRnaOrganisme, {
        rna: smallOrg.idRna,
      } as SyncOneRnaOrganismeJobPayload)
    } else if (smallOrg.idRnf) {
      await this.syncQueue.add(eJobName.SyncOneRnfOrganisme, {
        rnf: smallOrg.idRnf,
      } as SyncOneRnfOrganismeJobPayload)
    } else {
      throw new Error('impossible de synchroniser cette organisme')
    }
  }

  @UsualApiOperation({
    summary: 'Rechercher un organisme.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: Organisme,
  })
  @Get('search/:sentence')
  @Role(Roles.instructor)
  async searchOrganisme(@Param('sentence') sentence: string): Promise<ISiafSearchOrganismeResponseOutput[]> {
    this.logger.verbose('searchOrganisme')
    return this.organismeService.searchOrganismes(sentence)
  }
}
