import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { ServerResponse } from 'http'
import { Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'

import {
  Roles,
  mapOrganismeFieldHeader,
  IOrganisme,
  IOrganismeOutput,
  typeCategorieOrganisme,
  ISiafSearchOrganismeResponseOutput,
  ISiafRnfHistoryOutput,
} from '@biblio-num/shared'

import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { xlsxContent } from '@/shared/modules/xlsx/xlsx.constants'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'
import { PaginationDto } from '@/shared/pagination/pagination.dto'
import { PaginatedDto } from '@/shared/pagination/paginated.dto'
import { LeanDossierOutputDto } from '@/modules/dossiers/objects/dto/lean-dossier-output.dto'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { SyncOneRnaOrganismeJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { SiafRnfHistoryOutputDto } from '../objects/dto/siaf-rnf-history-output.dto'
import { OrganismeSyncService } from '../providers/organisme-sync.service'
import { OrganismeService } from '../providers/organisme.service'
@ApiTags('Organismes')
@Controller('organismes')
export class OrganismeController {
  constructor(
    private readonly logger: LoggerService,
    private readonly dossierService: DossierService,
    private readonly organismeService: OrganismeService,
    private readonly xlsxService: XlsxService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
    private readonly organismeSyncService: OrganismeSyncService,
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
        siaf: await this.organismeService.getAssocationFromHub(bn.idRna)
          .then(siaf => siaf).catch(reason => {
            this.logger.warn(`HUB-RNA: ${reason}`)
            return null
          }),
        type: typeCategorieOrganisme.rna,
      }
    } else if (bn.idRnf) {
      return {
        bn,
        siaf: null,
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
    const organisme = await this.organismeService.getOrganismeRnaFromAllServer(idRna)
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

    const organisme = await this.organismeService.getOrganismeRnfFromAllServer(idRnf)
    if (!organisme.bn && !organisme.siaf) {
      throw new NotFoundException(`La fondation ${idRnf} non trouvé`)
    }
    return organisme
  }

  @UsualApiOperation({
    summary: 'Retourner l\'historique d\'un organisme à partir de son RNF.',
    method: 'GET',
    minimumRole: Roles.instructor,
    isArray: true,
    supplement: 'L\'historique est récupéré depuis SIAF.',
    responseType: SiafRnfHistoryOutputDto,
  })
  @Get('rnf/:organismeIdRnf/history')
  @Role(Roles.instructor)
  async getSiafRnfHistory(@Param('organismeIdRnf') idRnf: string): Promise<ISiafRnfHistoryOutput[]> {
    this.logger.verbose('getSiafRnfHistory')
    return await this.organismeService.getOrganismeRnfHistoryFromSiaf(idRnf)
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
    minimumRole: Roles.instructor,
    responseType: null,
  })
  @Patch(':id/sync')
  @Role(Roles.instructor)
  async synchroniseOne(@Param('id') id: number): Promise<void> {
    this.logger.verbose('synchroniseOne')
    const smallOrg = await this.organismeService.findOneById(id)
    if (smallOrg.idRna) {
      await this.syncQueue.add(eJobName.SyncOneRnaOrganisme, {
        rna: smallOrg.idRna,
      } as SyncOneRnaOrganismeJobPayload)
    } else if (smallOrg.idRnf) {
      await this.organismeSyncService.addSyncOneRnf(smallOrg.idRnf, 1)
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

  @UsualApiOperation({
    summary: 'Supprimer un organisme.',
    method: 'DELETE',
    minimumRole: Roles.sudo,
    responseType: String,
  })
  @Delete(':id')
  @Role(Roles.sudo)
  async deleteOrganisme(@Param('id') id: number): Promise<string> {
    this.logger.verbose('deleteOrganisme')
    return this.organismeService.deleteOrganismeIfNotInDossiers(id)
  }

  @UsualApiOperation({
    summary: 'Add one foundation in BN.',
    method: 'POST',
    minimumRole: Roles.instructor,
    responseType: null,
  })
  @Post('rnf/:id')
  @Role(Roles.instructor)
  async addOneRnf(@Param('id') idRnf: string): Promise<void> {
    this.logger.verbose('addSynchroniseOne')
    await this.organismeService.addRnfWithSyncPriority(idRnf)
  }
}
