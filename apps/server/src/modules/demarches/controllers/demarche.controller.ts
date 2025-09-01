import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { InjectQueue } from '@nestjs/bull'
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

@ApiTags('Demarches')
@Controller('demarches')
export class DemarcheController {
  constructor(
    private readonly demarcheService: DemarcheService,
    private readonly demarcheSynchroniseService: DemarcheSynchroniseService,
    private readonly dossierService: DossierService,
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
}
