import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { InjectQueue } from '@nestjs/bull'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { Queue } from 'bull'
import { DemarcheService } from '../providers/services/demarche.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Demarche } from '../objects/entities/demarche.entity'
import { DemarcheSynchroniseService } from '../providers/services/demarche-synchronise.service'
import { DemarcheOutputDto } from '@/modules/demarches/objects/dtos/demarche-output.dto'

import { IRole, Roles } from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { CurrentUserRole } from '@/modules/users/providers/decorators/current-user-role.decorator'
import { CurrentDemarcheInterceptor } from '@/modules/demarches/providers/interceptors/current-demarche.interceptor'
import { CurrentDemarche } from '@/modules/demarches/providers/decorators/current-demarche.decorator'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { SyncOneDemarcheJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { SmallDemarcheOutputDto } from '@/modules/demarches/objects/dtos/small-demarche-output.dto'
import { CreateDemarcheDto } from '@/modules/demarches/objects/dtos/create-demarche.dto'
import { UpdateDemarcheDto } from '@/modules/demarches/objects/dtos/update-demarche.dto'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { DemarcheMaarchService } from '../providers/services/demarche-maarch.service'
import { ImportFiles, ImportResult } from '../objects/constants/maarch.types'
import { ImportMaarchDto } from '@/modules/demarches/objects/dtos/import-maarch.dto'

@ApiTags('Demarches')
@Controller('demarches')
export class DemarcheController {
  constructor(
    private readonly demarcheService: DemarcheService,
    private readonly demarcheSynchroniseService: DemarcheSynchroniseService,
    private readonly dossierService: DossierService,
    private readonly demarcheMaarch: DemarcheMaarchService,
    private readonly logger: LoggerService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @UsualApiOperation({
    summary: 'Retourne toutes les démarches.',
    method: 'GET',
    minimumRole: Roles.instructor,
    supplement:
      "Ne sont disponible que les démarches sur lesquelles l'utilisateur a des droits",
    responseType: SmallDemarcheOutputDto,
    isArray: true,
  })
  @Get('small')
  @Role(Roles.instructor)
  async allSmallDemarche(
    @CurrentUserRole() role: IRole,
  ): Promise<SmallDemarcheOutputDto[]> {
    this.logger.verbose('allSmallDemarche')
    return this.demarcheService.findMultipleSmallDemarche({}, role)
  }

  @Get(':demarcheId')
  @UsualApiOperation({
    summary: 'Retourne une démarche.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: DemarcheOutputDto,
  })
  @Role(Roles.instructor)
  @UseInterceptors(CurrentDemarcheInterceptor)
  async getDemarcheById(
    @CurrentDemarche() demarche: Demarche,
  ): Promise<DemarcheOutputDto> {
    this.logger.verbose('getDemarcheById')
    return demarche
  }

  @Post('create')
  @UsualApiOperation({
    summary: 'Créé une démarche.',
    method: 'POST',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  @Role(Roles.sudo)
  async create(@Body() dto: CreateDemarcheDto): Promise<void> {
    this.logger.verbose('create')
    await this.demarcheSynchroniseService.createAndSynchronise(
      dto.idDs,
      dto.identification,
      dto.types,
    )
  }

  @Put(':demarcheId/sync')
  @Role(Roles.sudo)
  @UsualApiOperation({
    summary: "Force la synchronisation d'une démarche.",
    method: 'PUT',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  async syncOneDemarcheFromScratch(
    @Param('demarcheId', ParseIntPipe) demarcheId: number,
  ): Promise<void> {
    this.logger.verbose('syncOneDemarcheFromScratch')
    this.logger.debug('Adding SyncOneDemarche job in queue')
    await this.syncQueue.add(eJobName.SyncOneDemarche, {
      demarcheId,
      fromScratch: true,
    } as SyncOneDemarcheJobPayload)
  }

  @Patch(':demarcheId')
  @UsualApiOperation({
    summary: "Modifie l'identification ou les types d'une démarche",
    method: 'PATCH',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  @Role(Roles.sudo)
  async updateIdentification(
    @Param('demarcheId', ParseIntPipe) id: number,
    @Body() dto: UpdateDemarcheDto,
  ): Promise<void> {
    this.logger.verbose(`update identification of demarche ${id}`)
    await this.demarcheService.updateDemarche(id, dto)
    if (!Object.keys(dto).length) {
      throw new BadRequestException('Identification and types are undefined')
    }
  }

  @Patch(':demarcheId/soft-delete')
  @UsualApiOperation({
    summary: 'Supprime une démarche (soft).',
    method: 'PATCH',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  @Role(Roles.sudo)
  async softDeleteDemarche(
    @Param('demarcheId', ParseIntPipe) id: number,
  ): Promise<void> {
    this.logger.verbose(`soft delete demarche ${id}`)
    await this.dossierService.softDeleteDemarcheDossiers(id)
    await this.demarcheService.softDeleteDemarche(id)
  }

  @Post('/import/maarch')
  @UsualApiOperation({
    summary: 'Importe les démarches depuis Maarch.',
    method: 'POST',
    minimumRole: Roles.sudo,
    responseType: Boolean,
  })
  @ApiResponse({ status: 201, description: 'Fichiers traités avec succès.' })
  @ApiResponse({ status: 400, description: 'Fichiers manquants ou invalides.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: ImportMaarchDto,
    description: 'Fichiers CSV.',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Titre de la démarche',
        },
        demandes: {
          type: 'string',
          format: 'binary',
          description: 'Le fichier CSV contenant les demandes.',
        },
        annotations: {
          type: 'string',
          format: 'binary',
          description: 'Le fichier CSV contenant les annotations.',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'demandes', maxCount: 1 },
      { name: 'annotations', maxCount: 1 },
    ]),
  )
  @HttpCode(201)
  @Role(Roles.sudo)
  async importMaarch(
    @UploadedFiles() files: ImportFiles,
    @Body() importData: ImportMaarchDto,
  ): Promise<ImportResult> {
    this.logger.verbose('importMaarch')
    return this.demarcheMaarch.importDemarche(files, importData.title)
  }

  @Delete('/import/maarch/rollback/:demarcheId')
  @UsualApiOperation({
    summary: 'Annule une importation en supprimant la démarche et tous les dossiers.',
    method: 'DELETE',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  @Role(Roles.sudo)
  async rollbackImport(
    @Param('demarcheId', ParseIntPipe) demarcheId: number,
  ): Promise<{ message: string; }> {
    return this.demarcheMaarch.deleteImport(demarcheId)
  }
}
